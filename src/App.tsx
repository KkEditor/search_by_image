import { Col, message, Progress, Row, Spin, Upload, UploadProps } from "antd";
import { RcFile, UploadFile } from "antd/es/upload";
import { SyntheticEvent, useState, useEffect, useRef, useContext } from "react";
import "./app.scss";
import noneImage from "./assets/img/none-image.png";
import logo from "./assets/img/logo.png";
import bg from "./assets/img/bg.png";
import beta from "./assets/img/beta.png";
import axios from "axios";
import { v4 as uuid } from "uuid";
import Resizer from "react-image-file-resizer";

// import { uuid } from "uuid";

import clsx from "clsx";
import { io, Socket } from "socket.io-client";

import { ReloadIcon } from "./assets/svg/icon-svg";
import Stars from "./assets/components/star/Star";
import { DeviceDetectContext } from "./assets/lib/context/DeviceDetectContext";
import { toLowerCaseNonAccentVietnamese } from "./assets/contants/common";
// import { atob } from "buffer";
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

  const bottomRef = useRef<HTMLDivElement>(null);

  const [percent, setPercent] = useState<[string, number]>(["", 0]);

  const [originFile, setOriginFile] = useState();
  const [currentImage, setCurrentImage] = useState<string>();
  const [isSubmitted, setIsSubmited] = useState(false);
  const [data, setData] = useState<IData[]>([]);
  const [loading, setLoading] = useState(false);
  const [socket, setSocket] = useState<Socket>();

  const [selectedImage, setSelectedImage] = useState<IData>();

  const props: UploadProps = {
    maxCount: 1,
    showUploadList: false,
    async onChange(info) {
      const { status } = info.file;
      if (status !== "uploading") {
      }
      if (status === "done") {
        const resizeFile: any = await new Promise((resolve) => {
          Resizer.imageFileResizer(
            info.file.originFileObj as File,
            300,
            300,
            "JPEG",
            100,
            0,
            (uri) => {
              resolve(uri);
            },
            "blob"
          );
        });

        const base64 = await getBase64(resizeFile as RcFile);

        setCurrentImage(base64);
        setOriginFile(resizeFile);
        message.success(`${info.file.name} file uploaded successfully.`);
      } else if (status === "error") {
        message.error(`${info.file.name} file upload failed.`);
      }
    },
  };

  useEffect(() => {
    if (!localStorage.getItem("uuidv4")) {
      localStorage.setItem("uuidv4", uuid());
    }

    axios.post("https://api-test.review-ty.com/graphql", {
      operationName: "imageSearchLog",
      variables: {
        data: {
          name: "test_search",
          message: JSON.stringify({
            date: new Date(),
            "device-token": localStorage.getItem("uuidv4"),
            status: "init",
          }),
        },
      },
      query:
        "mutation imageSearchLog($data: ActivityLogCreateInput!) {\n  actitvityLogs(data: $data)\n}\n",
    });

    const newSocket = io("https://ai.review-ty.com/", {
      extraHeaders: {
        "device-token": `${localStorage.getItem("uuidv4")}`,
      },
    });
    setSocket(newSocket);
    return () => {
      window.removeEventListener("beforeunload", () => {
        axios.post("https://api-test.review-ty.com/graphql", {
          operationName: "imageSearchLog",
          variables: {
            data: {
              name: "test_search",
              message: JSON.stringify({
                date: new Date(),
                "device-token": localStorage.getItem("uuidv4"),
                status: "destroy",
              }),
            },
          },
          query:
            "mutation imageSearchLog($data: ActivityLogCreateInput!) {\n  actitvityLogs(data: $data)\n}\n",
        });
      });

      newSocket.close();
    };
  }, []);

  useEffect(() => {
    if (isSubmitted || data.length > 0) {
      setTimeout(() => {
        bottomRef.current?.scrollIntoView({
          behavior: "smooth",
          inline: "end",
          block: "end",
        });
      }, 0);
    } else {
      window.scrollTo(0, 0);
    }

    return () => {};
  }, [isSubmitted, data]);

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

    setPercent(["", 0]);

    if (!currentImage) {
      message.error(`You must upload 1 file (png,jpg)`);
      return;
    }

    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
      inline: "end",
      block: "end",
    });
    setIsSubmited(true);
    setLoading(true);

    socket?.emit("process_image", originFile);

    socket?.on("process_image", (data) => {
      const responseData = JSON.parse(data);

      if (responseData) {
        setData(responseData);
        setSelectedImage(responseData[0]);
        setLoading(false);
      }
    });

    socket?.on("in_progress", (data) => {
      const splitPercetAndName = data.split(":");

      setPercent(splitPercetAndName);
    });
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
      {}
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
                        <span style={{ marginLeft: "8px" }}>
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
                        Xem chi tiết
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
                  <Col
                    span={24}
                    className="flex justify-center items-center flex-column"
                  >
                    <label>{percent[0]}</label>
                    <Progress percent={percent[1]} />
                  </Col>
                )}

                {data?.map((root) => (
                  <Col
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
                          disabled={loading || isSubmitted}
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
