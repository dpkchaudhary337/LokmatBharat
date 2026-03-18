"use client";

import React, { Fragment } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import parse from "html-react-parser";
import sanitizeHtml from "@/utils/sanitizeHtml";
import configData from './Config';


export default function RelatedNewsBlock(props: any) {
    return (
        <div className="col-md-3 mycol">
            <div className="single-news landScape-normal box_design_Line">
                <Link href={`${configData.BASE_URL_CATEGORY_DETAIL}${props.slug}`}>
                    <div className="content-wrapper">
                        <div className="img">
                        <div className="tag" style={props && props.color ? { backgroundColor: props.color } : { backgroundColor: '#9c27b0' }}>
                                {props.tag}
                            </div>
                            <Image 
                                src={props.image} 
                                alt={props.title} 
                                className="lazy"
                                width={400}
                                height={250}
                                style={{ width: "100%", height: "auto" }}
                                referrerPolicy="no-referrer"
                            />
                        </div>
                        <div className="inner-content">
                            <h4 className="title">
                                {props.title}
                            </h4>
                            {props.description && props.description.length > 0 && (
                                <div className="text">
                                    {parse(
                                        sanitizeHtml(
                                            props.description.length > 75
                                                ? props.description.substring(0, 75)
                                                : props.description
                                        ) + (props.description.length > 75 ? "..." : "")
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </Link>
            </div>
        </div>
    )

}