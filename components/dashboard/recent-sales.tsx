import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function RecentSales() {
  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle>Recent Sales</CardTitle>
        <CardDescription>You made 265 sales today</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {recentSales.map((sale) => (
            <div key={sale.id} className="flex items-center">
              <Avatar className="h-9 w-9">
                <AvatarImage src={sale.avatar || "/placeholder.svg"} alt={sale.name} />
                <AvatarFallback>{sale.initials}</AvatarFallback>
              </Avatar>
              <div className="ml-4 space-y-1">
                <p className="text-sm font-medium leading-none">{sale.name}</p>
                <p className="text-sm text-muted-foreground">{sale.email}</p>
              </div>
              <div className="ml-auto font-medium">+${sale.amount}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

const recentSales = [
  {
    id: 1,
    name: "Olivia Martin",
    email: "olivia.martin@email.com",
    amount: "1,999.00",
    avatar: "/placeholder.svg?height=32&width=32",
    initials: "OM",
  },
  {
    id: 2,
    name: "Jackson Lee",
    email: "jackson.lee@email.com",
    amount: "39.00",
    avatar: "/placeholder.svg?height=32&width=32",
    initials: "JL",
  },
  {
    id: 3,
    name: "Isabella Nguyen",
    email: "isabella.nguyen@email.com",
    amount: "299.00",
    avatar: "/placeholder.svg?height=32&width=32",
    initials: "IN",
  },
  {
    id: 4,
    name: "William Kim",
    email: "will@email.com",
    amount: "99.00",
    avatar: "/placeholder.svg?height=32&width=32",
    initials: "WK",
  },
  {
    id: 5,
    name: "Sofia Davis",
    email: "sofia.davis@email.com",
    amount: "39.00",
    avatar: "/placeholder.svg?height=32&width=32",
    initials: "SD",
  },
]
