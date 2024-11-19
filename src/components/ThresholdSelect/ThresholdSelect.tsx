import { Box, Button, TextField, Typography } from '@material-ui/core'
import { Fight } from 'api/fflogs/fight'
import { FFLogsParser } from 'api/fflogs/parser'
import { NameChip } from 'components/Result/Chip'
import { useTitle } from 'components/Title'
import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import styled from 'styled-components'
import { formatTimestamp } from 'util/format'

export const THRESHOLD_TARGETS = [
    30, // 0:30
    150, // 2:30
    270, // 4:30
    390, // 6:30
    510, // 8:30
]

const ThresholdSelectContainer = styled.div`
    transform: translateY(15vh);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 16px;
`

const FriendContainer = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
    max-width: 800px;
`

const FriendItem = styled.div`
    display: flex;
    flex-direction: row;
    flex-basis: 100%;
    flex-grow: 1;
    gap: 8px;
    align-items: center;
`

const FriendLabel = styled.div`
    flex-grow: 1;
`

const ThresholdInput = styled(TextField)`
    width: 100px;
`

export const ThresholdSelect = () => {
    const { reportID, fightID } = useParams()
    const { setTitle } = useTitle()
    const navigate = useNavigate()
    const [fight, setFight] = useState<Fight>()
    const [thresholds, setThresholds] = useState<{
        [id: number]: {
            [time: number]: number
        }
    }>({})

    setTitle('Configure Thresholds')

    const navigateToResults = () => {
        const searchParams = Object.entries(thresholds)
            .map(([friendID, targets]) => `${friendID}=${JSON.stringify(targets)}`)
            .join('&')

        navigate(`/live/${reportID}?${searchParams}`)
    }

    const updateThresholds = (friendID: number, target: number) =>
        (event: React.ChangeEvent<HTMLInputElement>) => {
            setThresholds({
                ...thresholds,
                [friendID]: {
                    ...thresholds[friendID],
                    [target]: parseInt(event.target.value),
                },
            })
        }

    const parser = useMemo(() =>
        new FFLogsParser(reportID, parseInt(fightID))
    , [fightID, reportID])

    useEffect(() => {
        const initializeParser = async () => {
            await parser.init()
            setFight(parser.fight)
        }
        initializeParser()
    }, [parser])

    if (fight == null) {
        return null
    }

    return (
        <ThresholdSelectContainer>
            <Box mb={1}>
                <Typography variant="h4">
                    Set Thresholds
                </Typography>
            </Box>
            <FriendContainer>
                {fight.friends.sort((a, b) => a.job.sortOrder - b.job.sortOrder).map(friend => (
                    <FriendItem key={friend.id}>
                        <FriendLabel>
                            <NameChip
                                name={friend.name}
                                job={friend.job}
                            />
                        </FriendLabel>
                        <div style={{
                            display: 'flex',
                            flexDirection: 'row',
                            gap: '8px',
                        }}>
                            {THRESHOLD_TARGETS.map((target, index) => (
                                <ThresholdInput
                                    key={index}
                                    id={`threshold-${index}`}
                                    variant="outlined"
                                    placeholder={formatTimestamp(target * 1000)}
                                    onChange={updateThresholds(friend.id, target)}
                                />
                            ))}
                        </div>
                    </FriendItem>
                ))}
            </FriendContainer>
            <Typography variant="h6">
                Enter each player's target rDPS at the given timestamp.
            </Typography>
            <Typography variant="h6">
                You can leave certain timestamps or players blank as desired.
            </Typography>
            <Button onClick={navigateToResults} variant="outlined">
                Start
            </Button>
        </ThresholdSelectContainer>
    )
}
