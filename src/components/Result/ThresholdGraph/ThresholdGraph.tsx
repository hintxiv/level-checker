import React from 'react'
import { Bar, BarChart, CartesianGrid, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { formatDamage } from 'util/format'
import { GraphTooltip } from '../Tooltip'
import styles from './ThresholdGraph.module.css'

interface ThresholdGraphProps {
    players: any[]
}

export function ThresholdGraph(props: ThresholdGraphProps) {
    const data = props.players.map(player => ({
        name: player.name,
        damage: player.damage,
        target: player.target,
        damageDelta: player.damageDelta,
    }))

    return <div className={styles.thresholdGraph}>
        <ResponsiveContainer width="100%" height="100%">
            <BarChart
                width={500}
                height={500}
                data={data}
                margin={{
                    top: 20,
                    right: 120,
                    left: 120,
                    bottom: 0,
                }}
            >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                    dataKey="name"
                    type="category"
                    stroke="white"
                    tick={playerNameTick(props.players)}
                    tickLine={false}
                />
                <YAxis
                    dataKey="damageDelta"
                    type="number"
                    stroke="white"
                    tickLine={false}
                    tickFormatter={formatDamage}
                />
                <Tooltip
                    cursor={{ fillOpacity: 0.1 }}
                    wrapperStyle={{ outline: 'none' }}
                    content={<GraphTooltip />}
                />
                <ReferenceLine
                    y={0}
                    stroke="#fff"
                    label={{
                        value: 'Target rDPS',
                        position: 'right',
                        fill: '#fff',
                        fontSize: 18,
                        offset: 10,
                    }}
                />
                <Bar dataKey="damageDelta" shape={renderBarShape('a')} />
            </BarChart>
        </ResponsiveContainer>
    </div>
}

interface AxisTickProps {
    x: number
    y: number
    payload: {
        coordinate: number
        value: string
        index: number
        offset: number
        tickCoord: number
    }
}

const renderBarShape = (key: string) => ({ height, width, x, y }: any) => {
    return (
        <svg x={x} y={height > 0 ? y : y + height} fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id={key + '-positive'} x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#3b8d1e" />
                    <stop offset="50%" stopColor="#56ab2f" />
                    <stop offset="100%" stopColor="#a8e063" />
                </linearGradient>
                <linearGradient id={key + '-negative'} x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#ff9a9e" />
                    <stop offset="50%" stopColor="#ff6a6a" />
                    <stop offset="100%" stopColor="#d32f2f" />
                </linearGradient>
            </defs>
            <rect
                fill={`url(#${key + (height > 0 ? '-positive' : '-negative')})`}
                width={width}
                height={Math.abs(height)}
            />
        </svg>
    )
}

const playerNameTick = (players: any[]) => (props: AxisTickProps) => {
    const { x, y, payload } = props

    const player = players.find(player => player.name === payload.value)

    if (player == null) { return }

    const initials = player.name
        .split(' ')
        .map((name: string) => name.charAt(0).toUpperCase() + '.')
        .join(' ')

    return <g
        transform={`translate(${x},${y})`}
        fill="white"
        style={{ paintOrder: 'stroke fill' }}
    >
        <text
            x={-2}
            y={15}
            textAnchor="end"
        >
            {initials}
        </text>
        <player.job.Icon
            height={30}
            width={30}
            x={6}
            y={-6}
        />
    </g>
}
