const express = require("express")
const app = express();
const axios = require("axios");
const bodyParser = require("body-parser");
const token = ''
const cors = require("cors");
const { MongoClient } = require("mongodb")
const url = ''
const databaseName = 'HW3'
app.use(express.static('dist/web-tech-assignment-3/browser'))


// add, retrieve and delete favorite object from the database
MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true })
.then(client => {
    const db = client.db(databaseName)
    const favoritesCollection = db.collection('favorites')
    favoritesCollection.createIndex({ stockProfileTicker: 1 }, { unique: true });

    app.post("/watchlist", async (req, res) => {
        try{
            let stockProfileTicker = req.body['stockProfileTicker']
            let stockName = req.body['stockName']
            await favoritesCollection.insertOne({
                "stockProfileTicker": stockProfileTicker,
                "stockName": stockName, 
            })
        } catch(err) {
            console.log(err)
        }
    })
    
    app.post("/add-watchlist-android", async (req, res) => {
        try{
            let stockProfileTicker = req.body['stockProfileTicker']
            let stockName = req.body['stockName']
            await favoritesCollection.insertOne({
                "stockProfileTicker": stockProfileTicker,
                "stockName": stockName, 
            })
            const watchlistData = await db.collection("favorites").find().toArray()
            res.json(watchlistData)
        } catch(err) {
            console.log(err)
        }
    })

    app.get('/watchlist', async (req, res) => {
        console.log("Generate watchlist")
        try{
            const watchlistData = await db.collection("favorites").find().toArray()
            res.json(watchlistData)
        } catch(err) {
            console.log(err)
        }
    })



    app.delete('/watchlist', async (req, res) => {
        try {
            let ticker = req.query['ticker']
            let deletedVal = await favoritesCollection.deleteOne({ stockProfileTicker: ticker })
            if(deletedVal.deletedCount == 1) {
                res.status(200).json({ message: "Favorite deleted successfully"})
            }
        } catch(err) {
            console.log(err)
        }
    })

    app.post('/remove-watchlist-android', async (req, res) => {
        try {
            console.log("Entered remove from watchlist")
            console.log(req.body)
            let ticker = req.query['ticker']
            console.log(ticker)
            let deletedVal = await favoritesCollection.deleteOne({ stockProfileTicker: ticker })
            if(deletedVal.deletedCount == 1) {
                // res.status(200).json({ message: "Favorite deleted successfully"})
                const watchlistData = await db.collection("favorites").find().toArray()
                res.json(watchlistData)
            }
        } catch(err) {
            console.log(err)
        }
    })

    app.get('/check-watchlist', async(req, res) => {
        let ticker = req.query['ticker']
        let result = await db.collection('favorites').findOne({ stockProfileTicker: ticker })
        if(result) {
            res.json({ exist: true})
        } else {
            res.json({ exist: false })
        }
    })

    app.get('/walletMoney', async (req, res) => {
        let result = await db.collection("wallet").findOne({ documentId: 1 })
        res.json(result)
    })

    app.post('/increase-wallet', async(req, res) => {
        let amount = parseFloat(req.query['amount'])
        const wallet = await db.collection("wallet").findOne({ documentId: 1})
        let newAmount = wallet.moneyInWallet + amount
        
        const updatedWallet = await db.collection("wallet").findOneAndUpdate(
            { documentId: 1 },
            { $set: { moneyInWallet: newAmount } },
            { new: true }
        );
        res.json(updatedWallet)
    })

    app.post('/increase-wallet-android', async(req, res) => {
        let amount = parseFloat(req.query['amount'])
        const wallet = await db.collection("wallet").findOne({ documentId: 1})
        let newAmount = wallet.moneyInWallet + amount
        
        const updatedWallet = await db.collection("wallet").findOneAndUpdate(
            { documentId: 1 },
            { $set: { moneyInWallet: newAmount } },
            { new: true }
        );
        let latestWallet = await db.collection("wallet").findOne({ documentId: 1})
        res.json(latestWallet)
    })

    app.post('/reduce-wallet-android', async(req, res) => {
        let amount = parseFloat(req.body['amount'])
        const wallet = await db.collection("wallet").findOne({ documentId: 1})
        let newAmount = wallet.moneyInWallet - amount
        const updatedWalletamount = await db.collection("wallet").findOneAndUpdate(
            { documentId: 1 }, 
            { $set: { moneyInWallet: newAmount } },
            { new: true }
        )
        let latestWallet = await db.collection("wallet").findOne({ documentId: 1})
        res.json(latestWallet)
    })


    app.post('/add-shares-android', async(req, res) => {
        let data = req.body
        let ticker = data['ticker']
        let quantity = data['quantity']
        let total_buy_cost = parseFloat((data['total_buy_cost']).toFixed(2))
        let currPrice = parseFloat((total_buy_cost/quantity).toFixed(2))

        let currentPrices = Array.from({ length: parseInt(data['quantity']) }, () => currPrice);

        let wallet = await db.collection("wallet").findOne({ documentId: 1})
        let finalWalletAmount = wallet.moneyInWallet - parseFloat((data['total_buy_cost']).toFixed(2))
        const updatedWalletamount = await db.collection("wallet").findOneAndUpdate(
            { documentId: 1 }, 
            { $set: { moneyInWallet: finalWalletAmount } },
            { new: true }
        )

        let result = await db.collection("portfolio").findOneAndUpdate(
            { ticker: ticker },
            { $inc: { quantity: data['quantity'], total_cost: parseFloat((data['total_buy_cost']).toFixed(2)) }, $setOnInsert: { stock_name: data['stock_name'] }, $push: { 
                stockPurchases: { $each: currentPrices } 
            }},
            { upsert: true, returnOriginal: false }
        )
        let latestPortfolioData = await db.collection("portfolio").find({}).toArray()
        let latestWalletMoney = await db.collection("wallet").findOne({ documentId: 1})
        res.json({latestPortfolioData, latestWalletMoney})
    })

    app.post('/sell-shares-android', async (req, res) => {
        let data = req.body
        let ticker = data['ticker']
        let sumOfstock = 0
        let quantity = parseInt(data['quantity'])
        let portfolio = await db.collection("portfolio").findOne({ ticker: ticker})
        let stockPurchases = portfolio.stockPurchases
        for(let i=0;i<quantity;i++) {
            sumOfstock += stockPurchases[i]
        }
        stockPurchases.splice(0,quantity)

        let wallet = await db.collection("wallet").findOne({ documentId: 1 })   
        let finalWalletAmount = wallet.moneyInWallet + parseFloat(data['total_sell_cost'])
        const updatedWalletamount = await db.collection("wallet").findOneAndUpdate(
            { documentId: 1 }, 
            { $set: { moneyInWallet: finalWalletAmount } },
            { new: true }
        )
        
        let result = await db.collection("portfolio").findOneAndUpdate(
            { ticker: ticker },
            { $inc: { quantity: -data['quantity'], total_cost: -parseFloat(sumOfstock) }, $set: { stockPurchases: stockPurchases } },
            { returnOriginal: false }
        )

        let val = await db.collection("portfolio").findOne({ ticker })
        if(val && val.quantity <= 0) {
            await db.collection("portfolio").deleteOne({ ticker: ticker });
        }

        let latestWalletMoney = await db.collection("wallet").findOne({ documentId: 1 })
        let latestPortfolioData = await db.collection("portfolio").find({}).toArray()
        res.json({latestWalletMoney, latestPortfolioData})
    })

    app.post('/reduce-wallet', async(req, res) => {
        let amount = parseFloat(req.body['amount'])
        const wallet = await db.collection("wallet").findOne({ documentId: 1})
        let newAmount = wallet.moneyInWallet - amount
        const updatedWalletamount = await db.collection("wallet").findOneAndUpdate(
            { documentId: 1 }, 
            { $set: { moneyInWallet: newAmount } },
            { new: true }
        )
        res.json(updatedWalletamount)
    })

    app.post('/add-shares', async(req, res) => {
        let data = req.body
        let ticker = data['ticker']
        let quantity = data['quantity']
        let total_buy_cost = parseFloat((data['total_buy_cost']).toFixed(2))
        let currPrice = parseFloat((total_buy_cost/quantity).toFixed(2))

        let currentPrices = Array.from({ length: parseInt(data['quantity']) }, () => currPrice);

        let wallet = await db.collection("wallet").findOne({ documentId: 1})
        let finalWalletAmount = wallet.moneyInWallet - parseFloat((data['total_buy_cost']).toFixed(2))
        const updatedWalletamount = await db.collection("wallet").findOneAndUpdate(
            { documentId: 1 }, 
            { $set: { moneyInWallet: finalWalletAmount } },
            { new: true }
        )

        let result = await db.collection("portfolio").findOneAndUpdate(
            { ticker: ticker },
            { $inc: { quantity: data['quantity'], total_cost: parseFloat((data['total_buy_cost']).toFixed(2)) }, $setOnInsert: { stock_name: data['stock_name'] }, $push: { 
                stockPurchases: { $each: currentPrices } 
            }},
            { upsert: true, returnOriginal: false }
        )


        res.json(result)
    })

    // sell shares
    app.post('/sell-shares', async (req, res) => {
        let data = req.body
        let ticker = data['ticker']
        let sumOfstock = 0
        let quantity = parseInt(data['quantity'])
        let portfolio = await db.collection("portfolio").findOne({ ticker: ticker})
        let stockPurchases = portfolio.stockPurchases
        for(let i=0;i<quantity;i++) {
            sumOfstock += stockPurchases[i]
        }
        stockPurchases.splice(0,quantity)
        // let updatedTotalCost = portfolio.total_cost - parseFloat(sumOfstock)
        // console.log(updatedTotalCost)

        let wallet = await db.collection("wallet").findOne({ documentId: 1 })   
        let finalWalletAmount = wallet.moneyInWallet + parseFloat(data['total_sell_cost'])
        const updatedWalletamount = await db.collection("wallet").findOneAndUpdate(
            { documentId: 1 }, 
            { $set: { moneyInWallet: finalWalletAmount } },
            { new: true }
        )
        
        let result = await db.collection("portfolio").findOneAndUpdate(
            { ticker: ticker },
            { $inc: { quantity: -data['quantity'], total_cost: -parseFloat(sumOfstock) }, $set: { stockPurchases: stockPurchases } },
            { returnOriginal: false }
        )

        let val = await db.collection("portfolio").findOne({ ticker })
        if(val && val.quantity <= 0) {
            await db.collection("portfolio").deleteOne({ ticker: ticker });
        }
        res.json(result)
    })

    // to check if a stock exists in portfolio or not
    app.get('/check-stock-portfolio', async(req, res) => {

    })

    app.get('/get-ticker-portfolio', async(req, res) => {
        let ticker = req.query['ticker']
        let portfolioDetails = await db.collection("portfolio").findOne({ ticker: ticker })
        res.json(portfolioDetails)
    })

    // app.post('/buy-shares-portfolio', async(req, res) => {
    //     let totalCostOfStockBuy = parseFloat(req.body['totalCost'])// quantity * curr price of stock while buying

    //     console.log(totalCostOfStockBuy)
    //     let wallet = await db.collection("wallet").findOne({ documentId: 1 })
    //     let finalWalletAmount = wallet.moneyInWallet - totalCostOfStockBuy

    //     const updatedWalletamount = await db.collection("wallet").findOneAndUpdate(
    //         { documentId: 1 }, 
    //         { $set: { moneyInWallet: finalWalletAmount } },
    //         { new: true }
    //     )
    //     res.json(updatedWalletamount)
    // })

    app.get('/portfolio-details', async(req, res) => {
        let portfolioDetails = await db.collection("portfolio").find().toArray()
        res.json(portfolioDetails)
    })

})

app.use(cors());

app.use(bodyParser.json())

const portNumber = process.env.PORT || 8081;
app.get('/company-desc', async (req, res) => {
    const stockTickerSymbol = req.query['ticker']
    try{
        const response = await axios.get(`https://finnhub.io/api/v1/stock/profile2?symbol=${stockTickerSymbol}&token=${token}`);
        const responseData = response.data
        res.json(responseData);
    } catch(err) {
        console.log(err)
    }
})

// app.get('/high-charts-data', async (req, res) => {
    
// })

app.get('/company-latest-price', async (req, res) => {
    const stockTickerSymbol = req.query['ticker']
    try {
        const response = await axios.get(`https://finnhub.io/api/v1/quote?symbol=${stockTickerSymbol}&token=${token}`)
        res.json(response.data)
    } catch(err) {
        console.log(err)
    }
})

app.get('/auto-complete', async (req, res) => {
    console.log("Entered AutoComplete Function")
    const query = req.query['text']
    try {
        const response = await axios.get(`https://finnhub.io/api/v1/search?q=${query}&token=${token}`)
        res.json(response.data)
    } catch(err) {
        console.log(err)
    }
})

function formatDate(date) {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`;
}

app.get('/company-news', async (req, res) => {
    const stockTickerSymbol = req.query['ticker']

    let currentDate = new Date()

    let fromDate = new Date()

    fromDate.setDate(currentDate.getDate() - 7)

    to_date = formatDate(currentDate)
    from_date = formatDate(fromDate)

    try {
        const response = await axios.get(`https://finnhub.io/api/v1/company-news?symbol=${stockTickerSymbol}&from=${from_date}&to=${to_date}&token=${token}`)
        return res.json(response.data)
    } catch(err) {
        console.log(err)
    }
})


app.get('/recommendation-trends', async (req, res) => {
    const stockTickerSymbol = req.query['ticker']
    try {
        const response = await axios.get(`https://finnhub.io/api/v1/stock/recommendation?symbol=${stockTickerSymbol}&token=${token}`)
        res.json(response.data)
    } catch(err) {
        console.log(err)
    }
})

app.get("/company-insider-sentiment", async (req, res) => {
    const stockTickerSymbol = req.query['ticker']
    try {
        const response = await axios.get(`https://finnhub.io/api/v1/stock/insider-sentiment?symbol=${stockTickerSymbol}&from=2022-01-01&token=${token}`)
        res.json(response.data)
    } catch(err) {
        console.log(err)
    }
})


app.get("/company-peers", async (req, res) => {
    const stockTickerSymbol = req.query['ticker']
    try {
        const response = await axios.get(`https://finnhub.io/api/v1/stock/peers?symbol=${stockTickerSymbol}&token=${token}`)
        res.json(response.data)
    } catch(err) {
        console.log(err)
    }
})

app.get("/company-earnings", async (req, res) => {
    const stockTickerSymbol = req.query['ticker'];
    try {
        const response = await axios.get(`https://finnhub.io/api/v1/stock/earnings?symbol=${stockTickerSymbol}&token=${token}`);
        let responseData = response.data.map(item => {
            return Object.entries(item).reduce((acc, [key, value]) => {
                acc[key] = value === null ? 0 : value;
                return acc;
            }, {});
        })
        return res.json(responseData);
    } catch(err) {
        console.log(err)
    }
})

app.get('/charts-tab-data', async (req, res) => {
    console.log("Entered Charts Tab Data")
    const stockTickerSymbol = req.query['ticker']
    try{
        let currDate = new Date()
        let relativeHighChartsDate = new Date()
        relativeHighChartsDate.setMonth(relativeHighChartsDate.getMonth() - 24)

        const from_date = new Date(currDate - relativeHighChartsDate)

        const currentDateFormatted = currDate.toISOString().split('T')[0];
        const finalHighchartsDateFormatted = from_date.toISOString().split('T')[0];

        const response = await axios.get(`https://api.polygon.io/v2/aggs/ticker/${stockTickerSymbol}/range/1/day/${finalHighchartsDateFormatted}/${currentDateFormatted}?adjusted=true&sort=asc&apiKey=F5ZetrE6pIX0nKCTU8MERDX43DBMwx57`)
        // console.log(response)
        res.json(response.data)
    } catch(err) {
        console.log(err)
    }
})

//const response = await axios.get(`https://api.polygon.io/v2/aggs/ticker/${stockTickerSymbol}/range/1/hour/${finalHighchartsDateFormatted}/${currentDateFormatted}?adjusted=true&sort=asc&apiKey=F5ZetrE6pIX0nKCTU8MERDX43DBMwx57`)
// from date -> if market is open 1 day before curr date is from date, to_date is curr date
// if market closd -> from date is 1day before the market close date, to_date is mqrket closing date
app.get('/market-hpd', async (req, res) => {
    try { 
        const stockTickerSymbol = req.query['ticker']
        const from_date = req.query['from_date']
        const to_date = req.query['to_date']
        const response = await axios.get(`https://api.polygon.io/v2/aggs/ticker/${stockTickerSymbol}/range/1/hour/${from_date}/${to_date}?adjusted=true&sort=asc&apiKey=F5ZetrE6pIX0nKCTU8MERDX43DBMwx57`)
        res.json(response.data)
    } catch(err) {
        console.log(err)
    }
})

// app.get('/market-close-hpd', async (req, res) => {
//     try{
//         const stockTickerSymbol = req.query['ticker']
//         const from_date = req.query['from_date']
//         const to_date = req.query['to_date']
//     } catch(err) {

//     }
// })


app.listen(portNumber, () => {
    console.log("Server is Up and Running at " + portNumber);
});
