"use client";

import React, { Fragment, useEffect, useState } from "react";
import { cachedAxiosGet } from "@/utils/apiCache";
import Link from "next/link";
import Image from "next/image";
import configData from '../Config';
import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'

// Swiper Imports
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";

export default function StateHeroArea(props: any){
    const homeSliderData = props.homeSlider || [];
    const rightSlider = props.rightSlider || [];

    const [settingData, setSettingData] = useState({
        YoutubeVideoURL: "",
      })
    
    
      const axiosConfig = {
        headers: {
          sessionToken: configData.SESSION_TOKEN,
        },
      };
    
      useEffect(() => {
        cachedAxiosGet(configData.SETTING_URL, axiosConfig).then((result: any) => {
          const data = result?._data ?? result;
          const settingDataValue = Array.isArray(data) ? data[0] : data;
          setSettingData(settingDataValue || { YoutubeVideoURL: "" });
        });
      }, []);


    const classes = props.classes;
    return(
        <Fragment>
            <section className="hero-area">
        <div className="container">
            <div className="row">

                <div className="col-lg-8">
                    {homeSliderData.length > 0 ? (
                        <Swiper
                            modules={[Autoplay, Pagination]}
                            autoplay={{ delay: 3000 }}
                            loop={true}
                            pagination={{ clickable: true }}
                            slidesPerView={1}
                            className="hero-swiper"
                        >
                            {homeSliderData.map((slider: any, index: number) => (
                                <SwiperSlide key={index}>
                                    <div className="item intro-carousel">
                                        <Link href={`${configData.BASE_URL_CATEGORY_DETAIL}${slider.Slug}`} className="single-news big">
                                            <div className="content-wrapper">
                                                <div className="tag" style={slider ? { backgroundColor: slider.CategoryColor } : { backgroundColor: '#9c27b0' }}>
                                                    {props.stateslug}
                                                </div>
                                                <Image
                                                    src={slider && slider.PostFiles && slider.PostFiles.length > 0 ? slider.PostFiles[0].AssetLiveUrl : "/assets/images/no-image.png"}
                                                    alt={slider.TitleData?.[0]?.Translation || ""}
                                                    width={900}
                                                    height={500}
                                                    style={{ width: "100%", height: "auto" }}
                                                    referrerPolicy="no-referrer"
                                                />
                                                <div className="inner-content">
                                                    <h4 className="title">
                                                        {slider.TitleData?.[0]?.Translation}
                                                    </h4>
                                                </div>
                                            </div>
                                        </Link>
                                    </div>
                                </SwiperSlide>
                            ))}
                        </Swiper>
                    ) : (
                        <Skeleton height={400} />
                    )}
                </div>
                <div className="col-lg-4 mycol">
              <div className="content-wrapper">
                {settingData.YoutubeVideoURL ? (
                  <div className="side-video-hero">
                    <iframe
                      className="heroYoutubeVideo"
                      frameBorder="0"
                      scrolling="no"
                      marginHeight={0}
                      marginWidth={0}
                      src={settingData.YoutubeVideoURL}
                      allowFullScreen
                    ></iframe>
                  </div>
                ) : (
                  <Skeleton height={250} />
                )}
              </div>
              {rightSlider && rightSlider.length > 0 ? rightSlider.slice(0, 1).map((slider: any, i: number) => (
                slider && slider.TitleData?.[0]?.Translation ? (
                  <Link
                    key={i}
                    href={`${configData.BASE_URL_CATEGORY_DETAIL}${slider?.Slug || ''}`}
                    className={`single-news animation ${i === 0 ? "mt-15" : ""}`}
                  >
                    <div className="content-wrapper">
                      <div className="tag" style={{backgroundColor: slider?.CategoryColor || '#9c27b0'}}>{slider?.CategoryName || ''}</div>
                      <Image
                        src={slider?.PostFiles?.length > 0 ? slider.PostFiles[0].AssetLiveUrl : "/assets/images/no-image.png"}
                        alt={slider.TitleData[0].Translation}
                        width={600}
                        height={400}
                        style={{ width: "100%", height: "auto" }}
                        className="lazy"
                        referrerPolicy="no-referrer"
                      />
                      <div className="inner-content">
                        <h4 className="title">
                          {slider.TitleData[0].Translation}
                        </h4>
                      </div>
                    </div>
                  </Link>
                ) : null
              )) : null}
            </div>

            </div>
        </div>
    </section>
        </Fragment>
    )

}