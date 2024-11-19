import { Typography } from '@material-ui/core'
import React from 'react'
import { TooltipProps } from 'recharts'
import { formatDamage } from 'util/format'
import styles from './Tooltip.module.css'

export const GraphTooltip = ({
    active,
    payload,
    label,
}: TooltipProps<number, string>): JSX.Element => {
    if (active && payload && payload.length > 0) {
        const items = payload.filter(item => item.value != null && item.value !== 0)

        return <div className={styles.container}>
            <div className={styles.header}>
                <Typography variant="h6" className={styles.header}>
                    {label}
                </Typography>
            </div>
            {items.map(item =>
                <div className={styles.content} key={item.dataKey}>
                    <div>
                        <div className={styles.label}>
                            <Typography>rDPS:</Typography>
                        </div>
                        <div className={styles.value}>
                            <Typography>{formatDamage(item.payload.damage)}</Typography>
                        </div>
                    </div>
                    <div>
                        <div className={styles.label}>
                            <Typography>Target:</Typography>
                        </div>
                        <div className={styles.value}>
                            <Typography>{formatDamage(item.payload.target)}</Typography>
                        </div>
                    </div>
                    <div>
                        <div className={styles.label}>
                            <Typography>{item.value > 0 ? 'Ahead' : 'Behind'} By:</Typography>
                        </div>
                        <div className={styles.value}>
                            <Typography>{formatDamage(item.value)}</Typography>
                        </div>
                    </div>
                </div>
            )}
        </div>
    }

    return null
}
