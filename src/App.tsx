import { Col, message, Row, Upload, UploadProps } from "antd";
import { RcFile, UploadFile } from "antd/es/upload";
import { SyntheticEvent, useState } from "react";
import "./app.scss";
import noneImage from "./assets/img/none-image.png";
import logo from "./assets/img/logo.png";
import bg from "./assets/img/bg.png";
import beta from "./assets/img/beta.png";
import axios from "axios";
import clsx from "clsx";

import { ReloadIcon } from "./assets/svg/icon-svg";
import Stars from "./assets/components/star/Star";

const { Dragger } = Upload;

export interface IData {
  product_id: string;
  review_count: string;
  review_avg_rate: string;
  url: string;
  name: string;
}

function App() {
  const [file, setFile] = useState<any>({});
  const [loadingPercentage, setLoadingPercentage] = useState(0);
  const [originFile, setOriginFile] = useState<UploadFile<any>>();
  const [currentImage, setCurrentImage] = useState<string>();
  const [isSubmitted, setIsSubmited] = useState(false);
  const [data, setData] = useState<IData[]>([]);

  const [selectedImage, setSelectedImage] = useState<IData>();

  const props: UploadProps = {
    // showUploadList: false,
    async onChange(info) {
      console.log("day la change", info);
      const { status } = info.file;
      if (status !== "uploading") {
        console.log(info.file, info.fileList);
      }
      if (status === "done") {
        const base64 = await getBase64(info.file.originFileObj as RcFile);

        setFile(info.file);
        setCurrentImage(base64);
        setOriginFile(info.file);
        message.success(`${info.file.name} file uploaded successfully.`);
      } else if (status === "error") {
        message.error(`${info.file.name} file upload failed.`);
      }
    },
    onDrop(e) {
      console.log("Dropped files", e.dataTransfer.files);
    },
  };

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
    setIsSubmited(false);
  };

  const submitHandler = async (e: SyntheticEvent) => {
    e.preventDefault();
    setIsSubmited(true);

    const formData = new FormData();
    formData.append("image", originFile?.originFileObj as File);
    const response = await axios.post(
      `http://ec2-3-0-19-91.ap-southeast-1.compute.amazonaws.com:2030/process_image`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    if (response) {
      setData(response.data);
      setSelectedImage(response.data[0]);
    }
  };

  console.log("selected", selectedImage);

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
        <Row
          className="app-container"
          gutter={[30, 30]}
          style={{ position: "relative", transition: "all 2s" }}
        >
          <Col
            span={12}
            className="app-container__left"
            style={{ position: "relative" }}
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

              <div className="flex justify-center">
                <img src={bg} alt="logo" />
              </div>
            </div>
          </Col>
          <Col
            span={12}
            className={clsx("app-container__right", {
              uploaded: !isSubmitted === false,
            })}
          >
            <div className="app-container__right--card">
              <div className="app-container__right--card-title">
                <h2>
                  Reviewty AI - Search - By - Image{" "}
                  <span>
                    <img src={beta} alt="beta" />
                  </span>
                </h2>
              </div>

              <Row className={"upload-content__results"} gutter={[30, 30]}>
                {selectedImage ? (
                  <Col span={24}>
                    <h3>{selectedImage.name}</h3>
                    <div>
                      <Stars
                        ratingNumber={Number(selectedImage.review_avg_rate)}
                      />
                      <span>
                        ({selectedImage.review_avg_rate.slice(0, 3)}) (
                        {selectedImage.review_count})
                      </span>
                      <span></span>
                    </div>
                    <a>Link sản phẩm để đây</a>

                    <img
                      className="upload-content__results--main-img"
                      src={selectedImage.url}
                      alt="currentImage"
                    />
                  </Col>
                ) : (
                  <div>
                    <p>Loading... {loadingPercentage}%</p>
                  </div>
                )}

                {data?.map((root) => (
                  <Col
                    span={4}
                    key={Number(root?.product_id)}
                    onClick={() => selectImageHandler(root)}
                  >
                    <div>
                      <img
                        className={clsx({
                          "image-selected":
                            root.product_id === selectedImage?.product_id,
                        })}
                        src={root?.url}
                        style={{ width: "100%" }}
                        alt="asd"
                      />
                    </div>
                  </Col>
                ))}
              </Row>
              <div className={`upload-content ${isSubmitted && "show-image"}`}>
                <h3>Upload your file</h3>

                <Dragger
                  customRequest={dummyRequest}
                  {...props}
                  beforeUpload={(file) => {
                    const isJPG =
                      file.type === "image/jpeg" || file.type === "image/png";
                    if (!isJPG) {
                      message.error("You can only upload JPG or PNG file!");
                      return false;
                    } else {
                      return true;
                    }
                  }}
                >
                  {currentImage ? (
                    <div
                      // style={{ maxHeight: "384px" }}
                      className="upload-content__show-image"
                    >
                      <div
                        style={{
                          backgroundImage: `url(${currentImage})`,
                          backgroundRepeat: "no-repeat",
                          backgroundSize: "contain",
                          width: "100%",
                          backgroundPosition: "center center",
                          height: "500px",
                        }}
                      ></div>
                      {/* <img
                        src={currentImage}
                        style={{ width: "500px", height: "auto" }}
                        alt="draggerImage"
                      /> */}
                    </div>
                  ) : (
                    <div className="default-upload">
                      <div className="default-upload__wrapper">
                        <img src={noneImage} alt="noneImage" />
                        <h2>Click to upload</h2>
                        <p>or drag and drop it here</p>
                      </div>
                    </div>
                  )}
                </Dragger>

                <div className="btn-group flex">
                  <button
                    className="btn-clear"
                    type="button"
                    onClick={reloadHandler}
                  >
                    <ReloadIcon />
                  </button>
                  <button className="btn-submit" type="submit">
                    Submit
                  </button>
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
