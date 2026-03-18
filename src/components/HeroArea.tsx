"use client";

import React, { Fragment, useEffect, useState } from "react";
import axios from "axios";
import configData from "@/components/Config";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

import Image from "next/image";
import Link from "next/link";

// Swiper Imports
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";

interface HeroAreaProps {
  homeSlider: any[];
  rightSlider?: any[];
  classes?: string;
}

export default function HeroArea(props: HeroAreaProps) {
  const { homeSlider, rightSlider = [] } = props;

  const [settingData, setSettingData] = useState<{ YoutubeVideoURL: string }>({
    YoutubeVideoURL: "",
  });

  const axiosConfig = {
    headers: { sessionToken: configData.SESSION_TOKEN },
  };

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await axios.get(configData.SETTING_URL, axiosConfig);
        const payload = JSON.parse(response.data.payload)[0];
        setSettingData(payload);
      } catch (error) {
        console.error("Settings load failed:", error);
      }
    };

    fetchSettings();
  }, []);

  return (
    <Fragment>
      <section className="hero-area">
        <div className="container">
          <div className="row">

            {/* LEFT SLIDER */}
            <div className="col-lg-8">
              {homeSlider.length > 0 ? (
                <Swiper
                  modules={[Autoplay, Pagination]}
                  autoplay={{ delay: 3000 }}
                  loop={true}
                  pagination={{ clickable: true }}
                  slidesPerView={1}
                  className="hero-swiper"
                >
                  {homeSlider.map((slider, index) => (
                    <SwiperSlide key={index}>
                      <div className="item intro-carousel">

                        <Link href={`/details/${slider.Slug}`} className="single-news big">
                          <div className="content-wrapper">
                            <div
                              className="tag"
                              style={{ backgroundColor: slider.CategoryColor }}
                            >
                              {slider.CategoryName}
                            </div>

                            <Image
                              src={
                                slider.PostFiles?.length > 0
                                  ? slider.PostFiles[0].AssetLiveUrl
                                  : "/assets/images/no-image.png"
                              }
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

            {/* RIGHT SIDE VIDEO */}
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

              {/* RIGHT SLIDER ONE ITEM */}
              {rightSlider.slice(0, 1).map((slider, i) => (
                <Link
                  href={`${configData.BASE_URL_CATEGORY_DETAIL}${slider.Slug}`}
                  className={`single-news animation ${i === 0 ? "mt-15" : ""}`}
                  key={i}
                >
                  <div className="content-wrapper">
                    <div
                      className="tag"
                      style={{ backgroundColor: slider.CategoryColor }}
                    >
                      {slider.CategoryName}
                    </div>

                    <Image
                      className="lazy"
                      src={
                        slider.PostFiles?.length > 0
                          ? slider.PostFiles[0].AssetLiveUrl
                          : "/assets/images/no-image.png"
                      }
                      alt={slider.TitleData?.[0]?.Translation || ""}
                      width={600}
                      height={400}
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
              ))}
            </div>
          </div>
        </div>
      </section>
    </Fragment>
  );
}
