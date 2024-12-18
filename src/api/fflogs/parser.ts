import { formatTimestamp } from 'util/format'
import { fetchDamageTables, fetchEvents, fetchFight, FFLogsQuery, FFLogsResponseEvent } from './api'
import { EventFields, FFLogsEvent } from './event'
import { Fight } from './fight'
import { HitType } from './report'

const STATUS_OFFSET = 1000000

export class FFLogsParser {
    public reportID: string
    public fightID: number
    public fight: Fight

    constructor(reportID: string, fightID: number) {
        this.reportID = reportID
        this.fightID = fightID
    }

    public async init() {
        this.fight = await fetchFight(this.reportID, this.fightID)
    }

    public formatTimestamp = (time: number) => {
        const elapsed = time - this.fight.start
        return formatTimestamp(elapsed)
    }

    public async getDamageTables(): Promise<any> {
        const { elapsed, result } = await fetchDamageTables(this.fight)
        return {
            elapsed,
            rdpsEntries: result.entries.map((entry: any) => ({
                name: entry.name,
                id: entry.id,
                total: entry.totalRDPS,
                rdps: entry.total / elapsed * 1000,
                job: entry.type,
            })),
        }
    }

    public async * getEvents(debuffIDs: number[]): AsyncGenerator<FFLogsEvent, void, undefined> {
        const sourceIDs = this.fight.friends.map(source => source.id)

        const eventsJSON: FFLogsResponseEvent[] = []

        for (const ID of sourceIDs) {
            const eventsQuery: FFLogsQuery = {
                start: this.fight.start,
                end: this.fight.end,
                sourceid: ID,
            }

            const events = (await fetchEvents(this.fight, eventsQuery)).filter(event => {
                /* Because of how we're pulling events, we have some
                duplicated status events that need to be filtered */
                if (['applybuff', 'refreshbuff', 'removebuff'].includes(event.type)
                    && event.sourceID !== ID) {
                    return false
                }
                return true
            })

            eventsJSON.push(...events)
        }

        // Need to send a second query to get raid debuffs on enemies (mug / chain)
        const debuffFilter = debuffIDs
            .map(id => `ability.id=${id}`)
            .join(' or ')

        const debuffsQuery: FFLogsQuery = {
            start: this.fight.start,
            end: this.fight.end,
            filter: debuffFilter,
        }

        const debuffEventsJSON = await fetchEvents(this.fight, debuffsQuery)

        eventsJSON.push(...debuffEventsJSON)
        eventsJSON.sort((a, b) => a.timestamp - b.timestamp)

        for (const e of eventsJSON) {
            const sourcePet = this.fight.pets.find(pet => pet.id === e.sourceID)
            const sourceID = sourcePet != null ? sourcePet.ownerID : e.sourceID

            const targetPet = this.fight.pets.find(pet => pet.id === e.targetID)
            const targetID = targetPet != null ? targetPet.ownerID : (e.targetID ?? e.sourceID)

            // Ignore duplicated buff events on pets
            if (['applybuff', 'refreshbuff', 'removebuff'].includes(e.type) && targetPet != null) {
                continue
            }

            const targetInstance = e.targetInstance ?? 0

            const fields: EventFields = {
                timestamp: e.timestamp,
                sourceID: sourceID,
                targetID: targetID,
                targetKey: `${targetID}-${targetInstance}`,
            }

            // Parse the 'extraAbility' field to find status applying actions
            let appliedBy = undefined
            if (e.extraAbility) {
                appliedBy = e.extraAbility.guid
            }

            if (e.type === 'applybuff' || e.type === 'refreshbuff') {
                yield {
                    type: 'applybuff',
                    statusID: e.ability.guid - STATUS_OFFSET,
                    appliedBy: appliedBy,
                    ...fields,
                }

            } else if (e.type === 'removebuff') {
                yield {
                    type: e.type,
                    statusID: e.ability.guid - STATUS_OFFSET,
                    ...fields,
                }

            } else if (e.type === 'applydebuff' || e.type === 'refreshdebuff') {
                yield {
                    type: 'applydebuff',
                    statusID: e.ability.guid - STATUS_OFFSET,
                    appliedBy: appliedBy,
                    ...fields,
                }

            } else if (e.type === 'removedebuff') {
                yield {
                    type: e.type,
                    statusID: e.ability.guid - STATUS_OFFSET,
                    ...fields,
                }

            } else if (e.type === 'cast') {
                yield { type: e.type, actionID: e.ability.guid, ...fields }

            } else if (e.type === 'calculateddamage') {
                yield {
                    type: 'snapshot',
                    actionID: e.ability.guid,
                    amount: e.amount,
                    isCrit: e.hitType === HitType.CRITICAL,
                    isDH: !!e.directHit,
                    ...fields,
                }

            } else if (e.type === 'damage') {
                if (e.tick) {
                    yield {
                        type: 'tick',
                        statusID: e.ability.guid - STATUS_OFFSET,
                        amount: e.amount,
                        expectedCritRate: e.expectedCritRate,
                        actorPotencyRatio: e.actorPotencyRatio,
                        directHitPercentage: e.directHitPercentage,
                        ...fields,
                    }

                } else {
                    yield {
                        type: 'damage',
                        actionID: e.ability.guid,
                        amount: e.amount,
                        isCrit: e.hitType === HitType.CRITICAL,
                        isDH: !!e.directHit,
                        ...fields,
                    }
                }
            }
        }
    }
}
