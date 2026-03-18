"use client";

import React, { useState } from "react";
import axios from "axios";
import configData from "@/components/Config";
import Image from "next/image";
import Link from "next/link";

interface NewsletterProps {
  adRight3?: {
    pAsset?: { AssetLiveUrl: string };
    AdLink?: string;
  };
}

export default function Newsletter({ adRight3 }: NewsletterProps) {
  const [email, setEmail] = useState("");
  const [success, setSuccess] = useState(false);

  const axiosConfig = {
    headers: {
      sessionToken: configData.SESSION_TOKEN,
    },
  };

  const adImageRight3 = adRight3?.pAsset?.AssetLiveUrl || "/assets/images/no-image.png";
  const adRightLink3 = adRight3?.AdLink || "#";

  async function submitNewsletter() {
    if (!email) return alert("Please enter a valid email address!");

    try {
      const response = await axios.post(
        configData.NEWSLETTER_API,
        { PersonEmail: email },
        axiosConfig
      );

      if (response.data?.success) {
        setSuccess(true);
        setEmail("");
      } else {
        setSuccess(false);
        alert("Failed to subscribe. Please try again.");
      }
    } catch (error) {
      console.error("Newsletter submission error:", error);
      alert("Error submitting newsletter. Try again later.");
    }
  }

  return (
    <div className="main-content tab-view border-theme mt-15 subscribeSpace">
      <div className="row">
        <div className="col-lg-12 mycol">
          <div className="header-area">
            <h3 className="title">Subscribe Newsletter</h3>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-lg-12 mycol">
          <div className="aside-newsletter-widget mt-3 subarea">
            <h5 className="title">Subscribe Newsletter!</h5>
            <p>
              Stay updated with our latest news and articles directly in your inbox.
            </p>

            <div className="input-group mb-3">
              <input
                type="email"
                className="form-control"
                id="newsletter_email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="Enter your email"
                aria-label="Email"
              />
              <button
                type="button"
                className="input-group-text cursor-pointer"
                onClick={submitNewsletter}
                style={{ cursor: "pointer" }}
              >
                <i className="fa fa-arrow-right"></i>
              </button>
            </div>

            {success && (
              <span className="text-success">
                ✅ Newsletter Submitted Successfully!
              </span>
            )}
          </div>

          <div className="row">
            <div className="col-lg-12">
              <div className="ad-area">
                <Link href={adRightLink3} target="_blank">
                  <Image
                    src={adImageRight3}
                    alt="Advertisement"
                    width={400}
                    height={200}
                    style={{ marginBottom: "10px", width: "100%", height: "auto" }}
                  />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
