import React, { Fragment } from 'react'
import configData from './Config';
import Skeleton, {SkeletonTheme} from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'

interface HeroAreaSkeletonProps {
    homeSlider?: any;
    classes?: any;
}

export default function HeroAreaSkeleton(props: HeroAreaSkeletonProps){
    const homeSliderData = props.homeSlider;
    const classes = props.classes;
    return(
        <Fragment>
            <SkeletonTheme baseColor="#e6e6e6" highlightColor="#f2f2f2">
            <section className="hero-area">
        <div className="container">
            <div className="row py">

                <div className="col-lg-8 r-p">


                                <div className="item intro-carousel">
                            <a href="" className="single-news big">
                            <div className="content-wrapper">
                            <div className="tag">
                                <Skeleton highlightColor="#b3b3b3" width={150}/>
                                </div>
                                <Skeleton width={735} height={371}/>
                                <div className="inner-content">
                                    <span>
                                        <h4 className="title">
                                            <Skeleton highlightColor="#b3b3b3" width={600}/>
                                        </h4>
                                    </span>

                                </div>
                                </div>
                            </a>
                        </div>

                </div>
                <div className="col-lg-4 r-p mycol">
                    <a href="#" className="single-news animation">
                        <div className="content-wrapper">
                            <Skeleton width={366} height={205}/>
                            <div className="inner-content">
                                <span>
                                    <h4 className="title">
                                        <Skeleton />
                                    </h4>
                                </span>

                            </div>
                        </div>
                    </a>
                    <a href="#" className="single-news animation">
                        <div className="content-wrapper">

                            <Skeleton width={366} height={205}/>
                            <div className="inner-content">
                                <span>
                                    <h4 className="title">
                                    <Skeleton />
                                    </h4>
                                </span>

                            </div>
                        </div>
                    </a>
                </div>

            </div>
        </div>
    </section>
    </SkeletonTheme>
        </Fragment>
    )

}