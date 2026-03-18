import React, { Fragment, useEffect, useState } from 'react'
import configData from './Config';
import RelatedNewsBlock from './RelatedNewsBlock'
import Axios from "axios";

interface RelatedNewsProps {
    postId?: any;
}

export default function RelatedNews(props: RelatedNewsProps){
    const relatedNewsApiUrl = configData.RELATED_NEWS_API_URL + props.postId;
    const axiosConfig = {
        headers: {
          sessionToken: configData.SESSION_TOKEN,
        },
      };

    const [relatedNews, setRelatedNews] = React.useState<any[]>([]);

     useEffect(()=>{
         if(props.postId){

         
    if(relatedNews && relatedNews.length < 1){
        // Related News API - No caching, always fetch fresh data
        Axios.get(relatedNewsApiUrl, axiosConfig).then((response) => {
            const news = JSON.parse(response.data.payload || "[]");
            setRelatedNews(Array.isArray(news) ? news : []);
        }).catch(e=>{
            // console.log("data from server",e)
        })
    }
}
     },[props.postId]);
    if(!relatedNews || relatedNews.length === 0) return null;
    return(
        <Fragment>
            <section className="home-front-area">
        <div className="container">
            <div className="row">
                <div className="col-lg-12">
                    {/* <!-- News Tabs start --> */}
                    <div className="main-content tab-view border-theme HomePlace7">
                        <div className="row">
                            <div className="col-lg-12 mycol">
                                <div className="header-area">
                                    <h3 className="title">
                                        Related News
                                    </h3>
                                    {/* <a href="#">सभी देखें</a> */}
                                </div>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-lg-12">
                                <div className="tab-content" id="pills-tabContent">
                                    <div className="tab-pane fade show active" id="pills-Rajasthan" role="tabpanel" aria-labelledby="pills-Rajasthan-tab">
                                        <div className="row">
                                            {relatedNews.map((news: any, i: number) => {
                                                return(
                                                <RelatedNewsBlock
                                                    key={news.ID || i}
                                                    slug={news.Slug}
                                                    image={news && news.PostFiles && news.PostFiles.length > 0 ? news.PostFiles[0].AssetLiveUrl : "/assets/images/no-image.png"}
                                                    title={news.TitleData && news.TitleData[0] ? news.TitleData[0].Translation : ""}
                                                    color={news.CategoryColor}
                                                    tag={news.CategoryName}
                                                    description={news.DescriptionData && news.DescriptionData[0] ? news.DescriptionData[0].Translation : ""}
                                                />
                                                )
                                            })}

                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>


            </div>
        </div>
    </section>
        </Fragment>
    )

}