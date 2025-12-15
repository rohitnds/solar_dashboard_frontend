import React from 'react'
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

const StatsCard = ({title, value, diffrence}) => {
  return (
    <Card className="@container/card cursor-pointer">
        <CardHeader>
          <CardDescription>{title}</CardDescription>
          <CardTitle className="text-md font-semibold tabular-nums">
            {value}
          </CardTitle>
        </CardHeader>
        <CardFooter className="flex-col hidden items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Trending up this month (icon)
          </div>
          <div className="text-muted-foreground">
            Visitors for the last 6 months
          </div>
        </CardFooter>
      </Card>
  )
}

export default StatsCard