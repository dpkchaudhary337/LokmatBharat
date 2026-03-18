import React, { Fragment } from 'react'
import Skeleton, {SkeletonTheme} from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'

export default function AdAreaSkeleton(){
    return(
        <Fragment>
            <section className="top-header">
        <div className="container">
            <div className="row">
                <div className="col-lg-12">
                    <Skeleton width={1110} height={87}/>
                </div>
            </div>
        </div>
        </section>
        </Fragment>
    )

}