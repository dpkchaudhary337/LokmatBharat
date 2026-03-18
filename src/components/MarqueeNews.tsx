import React, { Fragment } from "react";
import Link from "next/link";
import configData from "./Config";

export default function MarqueeNews(props: any) {
  const news = props.news;
  return (
    <Fragment>
        <Link href={`${configData.BASE_URL_CATEGORY_DETAIL}${news.Slug}`}>{news.TitleData.length > 0 ? news.TitleData[0].Translation : ''}
        </Link> <i className="fa fa-angle-double-right"></i>
    </Fragment>
  );
}
