import React, { Fragment } from 'react'
import LazyImage from './LazyImage';

interface AdAreaProps {
    adHeader?: any;
}

export default function AdArea(props: AdAreaProps){
    const adsData = props.adHeader;
    const adImage = adsData ? adsData.pAsset.AssetLiveUrl : '';
    const adLink = adsData ? adsData.AdLink : '';
    return(
        <Fragment>
            <section className="top-header">
        <div className="container">
            <div className="row">
                <div className="col-lg-12">
                <a href={adLink || undefined} target="_blank" rel="noopener noreferrer">
                    <LazyImage src={adImage} alt="Header Advertisement" />
                </a>
                </div>
            </div>
        </div>
        </section>
        </Fragment>
    )

}