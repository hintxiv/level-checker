export interface Job {
    name: string
    color: string
    Icon: (props: React.SVGProps<SVGSVGElement>) => JSX.Element
    sortOrder: number
}
