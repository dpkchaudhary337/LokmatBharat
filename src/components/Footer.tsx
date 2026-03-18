"use client";

import React, { Fragment, useState } from "react";
import axios from "axios";
import Link from "next/link";
import Image from "next/image";
import configData from "./Config";

export default function Footer({
  footerMenu = [],
  settingData = {},
}: {
  footerMenu?: any[];
  settingData?: any;
}) {
  const adminURL = configData?.baseAdminUrl || "#";
  const newsletterApi = configData?.NEWSLETTER_API || "";
  const [success, setSuccess] = useState(false);
  const [email, setEmail] = useState("");

  const axiosConfig = {
    headers: {
      sessionToken: configData.SESSION_TOKEN,
    },
  };

  const submitNewsletter = async () => {
    if (!email) return;

    try {
      const postData = { PersonEmail: email };
      const response = await axios.post(newsletterApi, postData, axiosConfig);

      setSuccess(response?.data?.success || false);
      setEmail("");
    } catch (error) {
      console.error("Newsletter error:", error);
      setSuccess(false);
    }
  };

  return (
    <Fragment>
      <footer className="footer" id="footer">
        <div className="container">

          {/* Footer Top */}
          <div className="row">

            {/* About Widget */}
            <div className="col-md-3 col-lg-3">
              <div className="footer-widget about-widget">
                <div className="footer-logo">
                  <Link href="/">
                    <Image
                      src={settingData?.FooterLogoLiveUrl || "/assets/images/logo.png"}
                      alt="Footer Logo"
                      width={150}
                      height={50}
                    />
                  </Link>
                </div>

                <div className="fotter-social-links">
                  <ul>
                    {settingData?.FacebookLink && (
                      <li>
                        <a href={settingData.FacebookLink} target="_blank">
                          <Image
                            src="/assets/images/social/facebook.png"
                            alt="Facebook"
                            width={24}
                            height={24}
                          />
                        </a>
                      </li>
                    )}

                    {settingData?.TwitterLink && (
                      <li>
                        <a href={settingData.TwitterLink} target="_blank">
                          <Image
                            src="/assets/images/social/twitter.png"
                            alt="Twitter"
                            width={24}
                            height={24}
                          />
                        </a>
                      </li>
                    )}

                    {settingData?.YoutubeLink && (
                      <li>
                        <a href={settingData.YoutubeLink} target="_blank">
                          <Image
                            src="/assets/images/social/youtube.png"
                            alt="YouTube"
                            width={24}
                            height={24}
                          />
                        </a>
                      </li>
                    )}

                    {settingData?.InstagramLink && (
                      <li>
                        <a href={settingData.InstagramLink} target="_blank">
                          <Image
                            src="/assets/images/social/instagram.png"
                            alt="Instagram"
                            width={24}
                            height={24}
                          />
                        </a>
                      </li>
                    )}
                  </ul>
                </div>
              </div>
            </div>

            {/* Useful Links */}
            <div className="col-md-2 col-lg-2">
              <div className="footer-widget info-link-widget ilw1">
                <h4 className="title">USEFUL LINKS</h4>
                <ul className="link-list">
                  {footerMenu?.map((menu: any) => (
                    <li key={menu?.Slug}>
                      <Link href={`/${menu?.Slug}`}>
                        <span>{menu?.MenuTitle}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Contact Info */}
            <div className="col-md-4 col-lg-4">
              <div className="footer-widget blog-widget contact-footer">
                <h4 className="title">
                  <span>Contact Us</span>
                </h4>
                <div className="f-contact">
                  <ul>
                    <li>
                      <i className="fas fa-map-marker-alt"></i>
                      <span>{settingData?.Address}</span>
                    </li>

                    <li className="mt-45">
                      <i className="fas fa-phone"></i>
                      <a href={`tel:${settingData?.Mobile1}`}>{settingData?.Mobile1}</a>
                      {" | "}
                      <a href={`tel:${settingData?.Mobile2}`}>{settingData?.Mobile2}</a>
                    </li>

                    <li className="mt-45">
                      <i className="fas fa-envelope"></i>
                      <a className="text-theme" href={`mailto:${settingData?.MailID}`}>
                        {settingData?.MailID}
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Newsletter */}
            <div className="col-md-3 col-lg-3">
              <div className="social-links">
                <h4 className="title">Newsletter</h4>
              </div>

              <div className="f-contact">
                <i className="fas fa-envelope"></i> &nbsp;Subscribe for our daily news
              </div>

              <div className="news_letter">
                <div className="input-group mb-3">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="form-control"
                    placeholder="Email"
                    required
                  />
                  <button
                    className="input-group-append btn btn-theme"
                    onClick={submitNewsletter}
                    type="button"
                  >
                    SUBSCRIBE
                  </button>
                </div>

                {success && (
                  <span className="text-success">
                    Newsletter Submitted Successfully!
                  </span>
                )}
              </div>

              <ul className="link-list mt-2">
                <li>
                  <a href={adminURL} target="_blank">
                    <span>Admin | Reporter Login</span>
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Copyright */}
          <div className="copy-bg">
            <div className="container">
              <div className="row">
                <div className="col-lg-6 offset-md-3">
                  <div className="content copyright text-center">
                    <p>{settingData?.Copyright}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </footer>
    </Fragment>
  );
}
