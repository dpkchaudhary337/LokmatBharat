import React, { Fragment, useState, useEffect } from "react";
import MainMenuSubCategoryTabColumn from "./MainMenuSubCategoryTabColumn";
import configData from "./Config";
import Axios from "axios";

interface MainMenuSubCategoryTabProps {
    id?: any;
    categorySlug?: string;
    categoryName?: string;
    index?: number;
}

export default function MainMenuSubCategoryTab(props: MainMenuSubCategoryTabProps) {
  const categoryId = props.id;
  const categorySlug = props.categorySlug;
  const categoryName = props.categoryName;
  const [featurePost, setFeaturePost] = useState<any[]>([]);

  const postApiUrl = configData.FEATURE_POST_API_URL.replace(
    "#CATEGORY_SLUG",
    categorySlug || ""
  );

  const axiosConfig = {
    headers: {
      sessionToken: configData.SESSION_TOKEN,
    },
  };
  useEffect(()=>{
    Axios.get(postApiUrl, axiosConfig).then((response) => {
      setFeaturePost(JSON.parse(response.data.payload));
    })
  },[])

  if(!featurePost) return null;

  return (
    <div id={props.id} className={`go-tab-c${props.index==0?' active':''}`}>
      <div className="row">
      {featurePost.map((p, i) => {
        if(i<4){
        return(
        <MainMenuSubCategoryTabColumn
        key={`${p.Slug || p.ID || i}`}
        categoryName={categoryName}
        author={p.Author}
        createdOn={p.CreatedOn}
        slug={p.Slug}
        title={p.TitleData && p.TitleData[0] ? p.TitleData[0].Translation : ""}
        imageUrl={p.PostFiles && p.PostFiles[0] ? p.PostFiles[0].AssetLiveUrl : ""} />
        )
        }
      })}
      </div>
    </div>
  );
}
