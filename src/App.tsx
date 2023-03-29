import { Col, message, Row, Spin, Upload, UploadProps } from "antd";
import { RcFile, UploadFile } from "antd/es/upload";
import { SyntheticEvent, useState, useEffect, useRef, useContext } from "react";
import "./app.scss";
import noneImage from "./assets/img/none-image.png";
import logo from "./assets/img/logo.png";
import bg from "./assets/img/bg.png";
import beta from "./assets/img/beta.png";
import axios from "axios";
import clsx from "clsx";

import { ReloadIcon } from "./assets/svg/icon-svg";
import Stars from "./assets/components/star/Star";
import { DeviceDetectContext } from "./assets/lib/context/DeviceDetectContext";
import { toLowerCaseNonAccentVietnamese } from "./assets/contants/common";

const { Dragger } = Upload;

export interface IData {
  product_id: string;
  review_count: string;
  review_avg_rate: string;
  url: string;
  name: string;
}

function App() {
  const context = useContext(DeviceDetectContext);
  // console.log("context", );

  const bottomRef = useRef<HTMLDivElement>(null);

  const [originFile, setOriginFile] = useState<UploadFile<any>>();
  const [currentImage, setCurrentImage] = useState<string>();
  const [isSubmitted, setIsSubmited] = useState(false);
  const [data, setData] = useState<IData[]>([]);
  const [loading, setLoading] = useState(false);

  const [selectedImage, setSelectedImage] = useState<IData>();

  const props: UploadProps = {
    maxCount: 1,
    showUploadList: false,
    async onChange(info) {
      const { status } = info.file;
      if (status !== "uploading") {
      }
      if (status === "done") {
        const base64 = await getBase64(info.file.originFileObj as RcFile);

        setCurrentImage(base64);
        setOriginFile(info.file);
        message.success(`${info.file.name} file uploaded successfully.`);
      } else if (status === "error") {
        message.error(`${info.file.name} file upload failed.`);
      }
    },
  };

  useEffect(() => {
    if (data.length > 0 && bottomRef.current) {
      bottomRef.current?.scrollIntoView({
        behavior: "smooth",
        inline: "end",
        block: "end",
      });
    }
  }, [data]);

  const getBase64 = (file: RcFile): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });

  const dummyRequest = (dumpRequest: any) => {
    setTimeout(() => {
      dumpRequest.onSuccess();
    }, 0);
  };

  const reloadHandler = () => {
    setCurrentImage("");
    setData([]);
    setSelectedImage(undefined);
    setIsSubmited(false);
  };

  const submitHandler = async (e: SyntheticEvent) => {
    e.preventDefault();

    if (!currentImage) {
      message.error(`You must upload 1 file (png,jpg)`);
      return;
    }
    setIsSubmited(true);
    setLoading(true);

    const formData = new FormData();
    formData.append("image", originFile?.originFileObj as File);
    await axios
      .post(
        `http://ec2-18-136-120-15.ap-southeast-1.compute.amazonaws.com:2030/process_image`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      )
      .then((res) => {
        if (res) {
          console.log("response", res);
          setData(res.data);
          setSelectedImage(res.data[0]);
        }
      })
      .catch((error) => {
        message.error(`Upload Thất bại`);
      });

    setLoading(false);
  };

  const selectImageHandler = (dataImageSelected: IData) => {
    if (dataImageSelected) setSelectedImage(dataImageSelected);
  };
  return (
    <div
      className={clsx("App", {
        uploaded: !isSubmitted === false,
      })}
    >
      <form onSubmit={submitHandler}>
        <Row className="app-container" gutter={[30, 30]}>
          <Col
            xxl={12}
            xl={12}
            lg={24}
            md={24}
            sm={24}
            xs={24}
            className="app-container__left"
          >
            <div className="app-container__left--card">
              <div>
                <div className="app-container__left--card__logo">
                  <img src={logo} alt="logo" />
                </div>

                <h1>Convert your image to Product image in one click.</h1>

                <p>
                  Simply drag & drop a file in your device on the right and we
                  will convert your image to product image what you find
                </p>
              </div>

              <div className="app-container__left--card__img">
                <img src={bg} alt="logo" />
              </div>
            </div>
          </Col>
          <Col
            xxl={12}
            xl={12}
            lg={24}
            md={24}
            sm={24}
            xs={24}
            className={clsx("app-container__right", {})}
          >
            <div className="app-container__right--card">
              <div className="app-container__right--card-title">
                <h2>
                  Reviewty AI{" "}
                  <span className="relative">Search - By - Image</span>
                  <span>
                    <img src={beta} alt="beta" />
                  </span>
                </h2>
              </div>

              <Row
                className={"upload-content__results"}
                ref={bottomRef}
                style={{
                  padding: "36px",
                }}
              >
                {selectedImage ? (
                  <Col span={24} style={{ background: "transparent" }}>
                    <div style={{ paddingBottom: "30px" }}>
                      <h3 className="pt-3">{selectedImage.name}</h3>
                      <div className="pt-3">
                        <Stars
                          ratingNumber={Number(selectedImage.review_avg_rate)}
                        />
                        <span>
                          {selectedImage.review_avg_rate.slice(0, 3)} (
                          {selectedImage.review_count})
                        </span>
                        <span></span>
                      </div>
                      <a
                        href={
                          context.mobile
                            ? `https://review-ty.com/products/${selectedImage.product_id}`
                            : `https://community.review-ty.com/search/products/${
                                selectedImage.product_id
                              }/${toLowerCaseNonAccentVietnamese(
                                selectedImage.name
                              )
                                .split(" ")
                                .join("-")}`
                        }
                        target="_blank"
                        rel="noreferrer"
                      >
                        Link sản phẩm để đây
                      </a>
                      <div className="flex justify-center">
                        <div
                          className="background-image"
                          style={{
                            backgroundImage: `url(${selectedImage.url})`,
                          }}
                        ></div>
                      </div>
                    </div>
                  </Col>
                ) : (
                  <Col span={24} className="flex justify-center items-center">
                    <Spin spinning={loading}></Spin>
                  </Col>
                )}

                {data?.map((root) => (
                  <Col
                    style={{}}
                    className="cursor-pointer"
                    span={4}
                    key={Number(root?.product_id)}
                    onClick={() => selectImageHandler(root)}
                  >
                    <div>
                      <img
                        className={clsx("w-full", {
                          "image-selected":
                            root.product_id === selectedImage?.product_id,
                        })}
                        src={root?.url}
                        alt={root.name}
                      />
                    </div>
                  </Col>
                ))}
              </Row>
              <div>
                <div style={{ padding: "10px" }}>
                  <div
                    className={`upload-content ${isSubmitted && "show-image"}`}
                  >
                    <div style={{ padding: "10px" }} className="relative">
                      <h3 style={{ paddingBottom: "24px" }}>
                        Upload your file
                      </h3>

                      <Dragger
                        className={clsx({
                          "current-image-uploaded": currentImage,
                        })}
                        customRequest={dummyRequest}
                        {...props}
                        beforeUpload={(file) => {
                          const isJPG =
                            file.type === "image/jpeg" ||
                            file.type === "image/png";
                          if (!isJPG) {
                            message.error(
                              "You can only upload JPG or PNG file!"
                            );
                            return false;
                          } else {
                            return true;
                          }
                        }}
                      >
                        {currentImage ? (
                          <div className="upload-content__show-image">
                            <div
                              className="background-image"
                              style={{
                                backgroundImage: `url(${currentImage})`,
                              }}
                            ></div>
                          </div>
                        ) : (
                          <div className="default-upload">
                            <div className="default-upload__wrapper">
                              <img src={noneImage} alt="noneImage" />
                              <h2>Click to upload</h2>
                              <span>or drag and drop it here</span>
                            </div>
                          </div>
                        )}
                      </Dragger>

                      <div className="btn-group flex">
                        <button
                          disabled={loading}
                          className={clsx("btn-clear", {
                            "btn-disabled": loading,
                          })}
                          type="button"
                          onClick={reloadHandler}
                        >
                          <ReloadIcon />
                        </button>
                        <button
                          className={clsx("btn-submit", {
                            "btn-disabled": loading,
                          })}
                          type="submit"
                          disabled={loading}
                        >
                          Submit
                        </button>
                      </div>
                    </div>

                    <p>
                      Simply drag & drop a file in your device on the right and
                      we will convert your image to product image what you find
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Col>
        </Row>
      </form>
    </div>
  );
}

export default App;
