import React from "react";
import Axios from "axios";
import configData from "../Config";

interface ContactUsProps {
    menus?: any[];
    site_lang?: any;
    marqueeNews?: any[];
    adHeader?: any;
    adFooter?: any;
    adRight?: any;
    settingData?: any;
}

export default function ContactUs(props: ContactUsProps) {
  const menus = props.menus;
  const site_lang = props.site_lang;
  const marqueeNews = props.marqueeNews;
  const [success, setsuccess] = React.useState(false);

  const adHeader = props.adHeader;

  const adsDataFooter = props.adFooter;
  const adImageFooter = adsDataFooter ? adsDataFooter.pAsset.AssetLiveUrl : "";
  const adFooterLink = adsDataFooter ? adsDataFooter.AdLink : "";

  const adsDataRight = props.adRight;
  const adImageRight = adsDataRight ? adsDataRight.pAsset.AssetLiveUrl : "";
  const adRightLink = adsDataRight ? adsDataRight.AdLink : "";
  const settingData = props.settingData;

  const [contactData, setcontactData] = React.useState({
    name: "",
    email: "",
    phone: "",
    mssg: "",
  });
  const axiosConfig = {
    headers: {
      sessionToken: configData.SESSION_TOKEN,
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST",
      "Access-Control-Allow-Headers": "Origin, Content-Type, X-Auth-Token",
    },
  };
  const [error, seterror] = React.useState("");
  const Submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setsuccess(false);

    if (contactData.name.length == 0) {
      seterror("name");
      return;
    }
    if (contactData.email.length == 0) {
      seterror("email");
      return;
    }
    if (contactData.phone.length > 13 || contactData.phone.length < 10) {
      seterror("phone");
      return;
    }
    if (contactData.mssg.length == 0) {
      seterror("mssg");
      return;
    }

    seterror("");
    const postdata = {
      Name: contactData.name,
      Email: contactData.email,
      Mobile: contactData.phone,
      Description: contactData.mssg,
    };
    Axios.post(configData.CONTACT_US, postdata, axiosConfig).then((res) => {
      const success = res.data.success;
      if (success) {
        setcontactData({
          name: "",
          email: "",
          phone: "",
          mssg: "",
        });
        setsuccess(true);
      }
    });
  };

  return (
    <div>
      {/* <!--Content of each page--> */}
      {/*     contact Us Work Start */}

      <section className="hero-area news-details-page home-front-area">
        <div className="container">
          <div className="row">
            <div className="col-lg-12">
              <div className="details-content-area">
                <div className="row">
                  <div className="col-lg-6 details-post">
                    <div className="single-news">
                      <center>
                        <h4 className="title">Contact Us</h4>
                        <p style={{ fontSize: "15px", textAlign: "justify" }}>
                          Do you have any questions? Please do not hesitate to
                          contact us directly. <br />
                          Our team will come back to you within a matter of
                          hours to help you.
                        </p>
                      </center>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="hero-area news-details-page home-front-area">
        <div className="container">
          <div className="row">
            <div className="col-md-6">
              <form
                id="contact-form"
                name="contact-form"
                action="_SELF"
                onSubmit={Submit}
                className="contact-form"
              >
                <div
                  className="alert alert-info validation"
                  style={{ display: "none" }}
                >
                  <p className="text-left"></p>
                </div>
                <div
                  className="alert alert-success validation"
                  style={{ display: "none" }}
                >
                  <button type="button" className="close alert-close">
                    <span>×</span>
                  </button>
                  <p className="text-left"></p>
                </div>
                <div
                  className="alert alert-danger validation"
                  style={{ display: "none" }}
                >
                  <button type="button" className="close alert-close">
                    <span>×</span>
                  </button>
                  <p className="text-left"></p>
                </div>{" "}
                <input
                  type="hidden"
                  name="_token"
                  value="zOi61DdV5XfzT1nI7vbY9FsKXz5szP16PdswYpWe"
                />
                <div className="row">
                  <div className="col-md-6">
                    <div className="form-group">
                      <input
                        value={contactData.name}
                        onChange={(e) =>
                          setcontactData({
                            ...contactData,
                            name: e.target.value,
                          })
                        }
                        type="text"
                        id="name"
                        name="name"
                        required
                        placeholder="Your name"
                        className="form-control"
                      />
                      <p>
                        {error === "name" && (
                          <span style={{ color: "red", fontSize: 20 }}>*</span>
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="form-group">
                      <input
                        value={contactData.email}
                        onChange={(e) =>
                          setcontactData({
                            ...contactData,
                            email: e.target.value,
                          })
                        }
                        type="text"
                        id="email"
                        name="email"
                        required
                        placeholder="Your email"
                        className="form-control"
                      />
                      <p>
                        {error === "email" && (
                          <span style={{ color: "red", fontSize: 20 }}>*</span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="row">
                  <div className="col-md-12">
                    <div className="form-group">
                      <input
                        value={contactData.phone}
                        onChange={(e) =>
                          setcontactData({
                            ...contactData,
                            phone: e.target.value,
                          })
                        }
                        type="number"
                        id="phone_no"
                        name="phone_no"
                        placeholder="Phone No"
                        className="form-control"
                        required
                        pattern="[1-9]{1}[0-9]{9}"
                        maxLength={10}
                      />
                      <p>
                        {error === "phone" && (
                          <span style={{ color: "red", fontSize: 20 }}>*</span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="row">
                  <div className="col-md-12">
                    <div className="form-group">
                      <textarea
                        value={contactData.mssg}
                        onChange={(e) =>
                          setcontactData({
                            ...contactData,
                            mssg: e.target.value,
                          })
                        }
                        id="message"
                        name="message"
                        rows={4}
                        placeholder="Your message"
                        className="form-control"
                      ></textarea>
                      <p>
                        {error === "mssg" && (
                          <span style={{ color: "red", fontSize: 20 }}>*</span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="text-center text-md-left">
                  <button type="submit" className="submit-btn">
                    Submit
                  </button>
                </div>
              </form>

              <div style={{ marginTop: 20 }} className="status">
                {success && (
                  <span className="text-success">
                    Thank you for contacting us. We will revert back to you.
                  </span>
                )}
              </div>
            </div>

            <div className="col-md-6">
              <ul className="contact-address list-unstyled mb-0">
                <li>
                  <i className="fas fa-map-marker-alt fa-2x color-theme"></i>
                  <p>{settingData.Address}</p>
                </li>

                <li>
                  <i className="fas fa-phone mt-4 fa-2x color-theme"></i>
                  <p>
                    <a href={"tel:" + settingData.Mobile1}>
                      {settingData.Mobile1}
                    </a>
                    ,
                    <a href={"tel:" + settingData.Mobile2}>
                      {settingData.Mobile2}
                    </a>
                  </p>
                </li>

                <li>
                  <i className="fas fa-envelope mt-4 fa-2x color-theme"></i>
                  <p>
                    <a href={"mailto:" + settingData.MailID}>{settingData.MailID}</a>
                  </p>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {adImageFooter && (
        <section className="home-front-area">
          <div className="container">
            <div className="row">
              <div className="col-lg-12">
                {/* <!-- News Tabs start --> */}
                <div className="main-content tab-view">
                  <div className="row">
                    <div className="col-lg-12 mycol padding_15">
                      <a href={adFooterLink} target="_blank" rel="noopener noreferrer">
                        <img src={adImageFooter} alt="Advertisement" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Constact us work end */}
      <div className="bottomtotop">
        <i className="fas fa-chevron-right"></i>
      </div>
    </div>
  );
}
