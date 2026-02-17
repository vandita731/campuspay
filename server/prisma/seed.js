const {PrismaClient} = require("@prisma/client")
const prisma = new PrismaClient()

async function main(){

    await prisma.category.createMany({
        data:[
            {name: "Rent" ,icon:"🏠"},
            {name: "Food",icon:"🍔"},
            {name: "Transport",icon:"🚌"},
            {name: "Entertainment",icon:"🎬"},
            {name:"Shopping",icon:"🛍️"},
            {name:"Books",icon:"📚"},
            {name:"Subscription",icon:"📱"},
            {name:"Others",icon:"📦"},
        ]
    }
    )
}


main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
