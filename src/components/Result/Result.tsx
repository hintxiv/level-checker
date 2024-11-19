import { CircularProgress } from '@material-ui/core'
import { fetchLastFightID } from 'api/fflogs/api'
import { Fight } from 'api/fflogs/fight'
import { FFLogsParser } from 'api/fflogs/parser'
import { useAsyncError } from 'components/ErrorBoundary/throwError'
import { useTitle } from 'components/Title'
import { JOBS } from 'data/jobs'
import React, { useCallback, useEffect, useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { formatTimestamp } from 'util/format'
import styles from './Result.module.css'
import { ThresholdGraph } from './ThresholdGraph/ThresholdGraph'

const DEFAULT_REFRESH_INTERVAL_MS = 10000

export function Result() {
    const { reportID } = useParams()
    const [searchParams] = useSearchParams()
    const { setTitle } = useTitle()
    const asyncThrow = useAsyncError()
    const [rdpsEntries, setRdpsEntries] = useState(null)
    const [duration, setDuration] = useState(0)
    const [fight, setFight] = useState<Fight>(null)
    const [ready, setReady] = useState(false)

    const computeDamageTarget = useCallback((timeElapsed: number, playerID: number) => {
        const playerThresholdParam = searchParams.get(playerID.toString())

        if (playerThresholdParam == null) {
            return 0
        }

        const thresholds = JSON.parse(playerThresholdParam)

        // Find the thresholds before and after the elapsed time
        let prevThreshold = null
        let prevThresholdTime = null
        let nextThreshold = null
        let nextThresholdTime = null

        for (const [time, threshold] of Object.entries(thresholds)) {
            const msTime = parseInt(time) * 1000
            if (msTime <= timeElapsed) {
                prevThreshold = threshold as number
                prevThresholdTime = msTime
            } else {
                nextThreshold = threshold as number
                nextThresholdTime = msTime
                break
            }
        }

        // Linear interpolation between the two thresholds
        const threshold = prevThreshold == null
            ? nextThreshold
            : nextThreshold == null
                ? prevThreshold
                : prevThreshold + (nextThreshold - prevThreshold) * (timeElapsed - prevThresholdTime) / (nextThresholdTime - prevThresholdTime)

        return threshold
    }, [searchParams])

    const fetchAndSetDamage = useCallback(async () => {
        const latestFightID = await fetchLastFightID(reportID)
        const parser = new FFLogsParser(reportID, latestFightID)
        await parser.init()
        setFight({...parser.fight})

        const { elapsed, rdpsEntries } = await parser.getDamageTables()

        setDuration(elapsed)
        setRdpsEntries(
            rdpsEntries
                .map((entry: any) => ({
                    ...entry,
                    damage: entry.rdps,
                    target: computeDamageTarget(elapsed, entry.id),
                    damageDelta: entry.rdps - computeDamageTarget(elapsed, entry.id),
                    job: Object.values(JOBS).find(job => job.name.replace(/\s/g, '') === entry.job),
                }))
                .filter((entry: any) => entry.job != null)
                .sort((a: any, b: any) => b.damageDelta - a.damageDelta)
        )
        setReady(true)
    }, [computeDamageTarget, reportID])

    useEffect(() => {
        fetchAndSetDamage().catch(asyncThrow)
        const timer = setInterval(
            () => fetchAndSetDamage().catch(asyncThrow),
            DEFAULT_REFRESH_INTERVAL_MS,
        )

        return () => clearInterval(timer)
    }, [fetchAndSetDamage, asyncThrow])

    useEffect(() => setTitle(fight ? fight.encounter : 'Fetching...'), [fight, setTitle])

    if (!ready) {
        return <CircularProgress size={80} className={styles.loading} />
    }

    if (rdpsEntries == null || fight == null) {
        return null
    }

    return <div className={styles.result}>
        <div className={styles.label}>
            <a
                href={`https://www.fflogs.com/reports/${reportID}#fight=${fight.fightID}`}
                target="_blank"
                rel="noreferrer"
            >
                {fight.encounter} - {formatTimestamp(duration)}
            </a>
        </div>
        {fight.inProgress ?
            <div className={styles.info}>
                Pull in progress, updating every 10s...
            </div>
            : <div className={styles.info}>
                Pull complete, waiting for next pull...
            </div>
        }
        <ThresholdGraph players={rdpsEntries} />
    </div>
}
