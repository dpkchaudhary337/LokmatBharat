"use client";
import React, { Fragment } from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

export default function HomePlace1Skeleton() {
  return (
    <Fragment>
      <section className="home-front-area">
        <div className="container">
          <div className="row">
            {/* Left Section */}
            <div className="col-lg-8">
              <div className="main-content tab-view border-theme">
                <div className="row">
                  <div className="col-lg-12 mycol">
                    <div className="header-area">
                      <h3 className="title">
                        <Skeleton width={100} />
                      </h3>
                      <Skeleton width={50} />
                    </div>
                  </div>
                </div>

                <div className="row">
                  <div className="col-lg-12">
                    <div className="tab-content" id="pills-tabContent">
                      <div
                        className="tab-pane fade show active"
                        id="pills-Rajasthan"
                        role="tabpanel"
                        aria-labelledby="pills-Rajasthan-tab"
                      >
                        <div className="row">
                          {/* Big News Skeleton */}
                          <div className="col-md-6 mycol">
                            <div className="single-news landScape-normal box_design_block">
                              <div className="content-wrapper">
                                <div className="img">
                                  <Skeleton width={335} height={188} />
                                </div>
                                <div className="inner-content">
                                  <h4 className="title">
                                    <Skeleton />
                                  </h4>
                                  <p className="text">
                                    <Skeleton height={100} />
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Small News Skeletons */}
                          <div className="col-md-6 mycol">
                            <div className="row">
                              {[1, 2, 3, 4].map((i) => (
                                <div className="col-md-6 r-p" key={i}>
                                  <div className="single-box landScape-small-with-meta box_design_block">
                                    <div className="img">
                                      <Skeleton width={167} height={100} />
                                    </div>
                                    <div className="content">
                                      <h4 className="title">
                                        <Skeleton height={60} />
                                      </h4>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Section - Social Media */}
            <div className="col-lg-4">
              <div className="main-content tab-view border-theme">
                <div className="row">
                  <div className="col-lg-12 mycol">
                    <div className="header-area">
                      <Skeleton height={30} />
                    </div>
                  </div>
                </div>
                <div className="row">
                  <div className="col-lg-12 mycol">
                    <div className="blank">
                      <Skeleton height={200} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* Right End */}
          </div>
        </div>
      </section>
    </Fragment>
  );
}
