import dotenv from "dotenv";
dotenv.config();


// returned by api is
/*
{
"status": "ok",
"totalResults": 573,
"articles": [
                    {
                    "source": {
                    "id": "the-verge",
                    "name": "The Verge"
                    },
                    "author": "David Pierce",
                    "title": "Nest’s quest to fix your thermostat",
                    "description": "The founding story of Nest is pretty much a perfect tech myth. A legendary product maker (in this case, Tony Fadell) helps create one of the most successful products ever (the iPhone) and then rides off into the sunset to enjoy the rest of his life, only to h…",
                    "url": "https://www.theverge.com/podcast/958735/nest-thermostat-version-history",
                    "urlToImage": "https://platform.theverge.com/wp-content/uploads/sites/2/2026/06/VRH_Nest_Site.jpg?quality=90&strip=all&crop=0%2C10.732984293194%2C100%2C78.534031413613&w=1200",
                    "publishedAt": "2026-06-28T12:02:44Z",
                    "content": "<ul><li></li><li></li><li></li></ul>\r\nOn Version History: Why an Apple legend decided to reinvent the thermostat, and why he thought it might change everything.\r\nOn Version History: Why an Apple lege… [+2795 chars]"
                    },
            ]
}                    
*/

export const getNews = async (req,res)=>{
    const {city} = req.query;

    if(!city){
        return res.status(400).json({message:"City is required"})
    }
    try {
        const response  = await fetch(
            `https://newsapi.org/v2/everything?q=${city}+neighborhood+community+local&language=en&sortBy=publishedAt&pageSize=10&apiKey=${process.env.NEWS_API_KEY}`
        )

        const data = await response.json();

        if(data.status !== 'ok'){
            return res.status(500).json({message:"Failed to fetch the news"})
        }

        const news = data.articles.map(article=>({
            title: article.title,
            description: article.description,
            url: article.url,
            source: article.source.name,
            publishedAt: article.publishedAt,
            urlToImage: article.urlToImage
        }))

        return res.json({
            city,
            news
        })
    } catch (error) {
        console.error(error);
        return res.status(500).json({message:"Server Error"})
    }
}