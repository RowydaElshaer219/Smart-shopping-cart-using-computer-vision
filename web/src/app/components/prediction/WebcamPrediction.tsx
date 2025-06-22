// "use client";

// import React, { useRef, useEffect, useState } from "react";
// import Webcam from "react-webcam";
// import axios from "axios";

// interface Detection {
//   inference_id: string;
//   time: number;
//   image: {
//     width: number;
//     height: number;
//   };
//   predictions: Prediction[];
// }

// interface Prediction {
//   x: number;
//   y: number;
//   width: number;
//   height: number;
//   confidence: number;
//   class: string;
//   class_id: number;
//   detection_id: string;
// }

// const RealTimeDetection: React.FC = () => {
//   const webcamRef = useRef<Webcam>(null);
//   const [detection, setDetection] = useState<string | null>(null);
//   const [isDetecting, setIsDetecting] = useState<boolean>(false);

//   // Function to capture the image and detect the product
//   const detectProduct = async () => {
//     if (!webcamRef.current) return;

//     const imageSrc = webcamRef.current.getScreenshot(); // Capture the current frame
//     if (!imageSrc) return;

//     const base64Image = imageSrc.split(",")[1]; // Remove the Base64 prefix

//     try {
//       const response = await axios.post<Detection>(
//         "https://detect.roboflow.com/egyptian-market-products/3",
//         base64Image,
//         {
//           params: {
//             api_key: "K3DGLdydynKvl5fNNlxV",
//           },
//           headers: { "Content-Type": "application/x-www-form-urlencoded" },
//         }
//       );

//       // Extract the class of the first prediction if available
//       const firstPrediction = response.data.predictions[0];
//       setDetection(
//         firstPrediction ? firstPrediction.class : "No prediction found"
//       );
//     } catch (error: any) {
//       console.error("Error detecting product:", error.message);
//     }
//   };

//   // Function to run the detection loop
//   const startDetectionLoop = () => {
//     setIsDetecting(true);
//     const interval = setInterval(() => {
//       detectProduct();
//     }, 1000); // Run every 1 seconds

//     return () => clearInterval(interval); // Cleanup on unmount
//   };

//   useEffect(() => {
//     if (isDetecting) {
//       const stopDetectionLoop = startDetectionLoop();
//       return () => stopDetectionLoop();
//     }
//   }, [isDetecting]);

//   return (
//     <div className="w-full flex flex-col justify-center px-10 ">
//       <h1 className="text-3xl text-background font-bold font-sans pb-10 absolute top-44 ">
//         Real-Time Product Detection
//       </h1>

//       <div className="flex gap-5 w-full h-[600px]">
//         <div className="w-full">
//           <Webcam
//             className="w-full  h-[600px]"
//             ref={webcamRef}
//             screenshotFormat="image/jpeg"
//             width="100%"
//             videoConstraints={{
//               facingMode: "environment", // Use the back camera if available
//             }}
//           />
//         </div>
//         <div className="w-full flex flex-col justify-center items-center">
//           {detection && (
//             <div className=" flex flex-col w-full justify-center items-center ">
//               <h2 className="text-primary text-2xl font-bold font-sans">
//                 Detected Class:
//               </h2>
//               <p className="text-secondary pl-4 text-xl">{detection}</p>
//             </div>
//           )}
//         </div>
//       </div>
//       <div className="-mt-10">
//         <button
//           className="bg-background text-text px-6 py-3 rounded-2xl text-xl font-medium hover:text-primary cursor-pointer "
//           onClick={() => setIsDetecting(!isDetecting)}
//         >
//           {isDetecting ? "Stop Detection" : "Start Detection"}
//         </button>
//       </div>
//     </div>
//   );
// };

// export default RealTimeDetection;


"use client";

import React, { useRef, useEffect, useState } from "react";
import Webcam from "react-webcam";
import axios from "axios";

interface Detection {
  inference_id: string;
  time: number;
  image: {
    width: number;
    height: number;
  };
  predictions: Prediction[];
}

interface Prediction {
  x: number;
  y: number;
  width: number;
  height: number;
  confidence: number;
  class: string;
  class_id: number;
  detection_id: string;
}

const RealTimeDetection: React.FC = () => {
  const webcamRef = useRef<Webcam>(null);
  const [detection, setDetection] = useState<string | null>(null);
  const [isDetecting, setIsDetecting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  let intervalId: NodeJS.Timeout | null = null;

  const detectProduct = async () => {
    if (!webcamRef.current) return;

    const imageSrc = webcamRef.current.getScreenshot();
    if (!imageSrc) return;

    const base64Image = imageSrc.split(",")[1];

    try {
      const response = await axios.post<Detection>(
        "https://detect.roboflow.com/egyptian-market-products/3",
        base64Image,
        {
          params: {
            api_key: "K3DGLdydynKvl5fNNlxV",
          },
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
        }
      );

      const firstPrediction = response.data.predictions[0];
      setDetection(
        firstPrediction ? firstPrediction.class : "No prediction found"
      );
      setErrorMessage(null); // Clear error message on success
    } catch (error: any) {
      console.error("Error detecting product:", error.message);
      setErrorMessage("Failed to detect product. Please try again.");
    }
  };

  const toggleDetection = () => {
    if (isDetecting) {
      setIsDetecting(false);
      if (intervalId) clearInterval(intervalId);
    } else {
      setIsDetecting(true);
      intervalId = setInterval(detectProduct, 1000);
    }
  };

  useEffect(() => {
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, []);

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-100 py-10 px-6">
      <h1 className="text-4xl font-bold text-gray-800 mb-8 text-center">
        Real-Time Product Detection
      </h1>

      <div className="flex flex-wrap gap-10 w-full max-w-6xl items-center justify-center">
        {/* Webcam Feed */}
        <div className="relative w-full max-w-md">
          <Webcam
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            className="w-full h-72 rounded-lg border border-gray-300 shadow-md"
            videoConstraints={{ facingMode: "environment" }}
          />
        </div>

        {/* Detection Info */}
        <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-6">
          {detection ? (
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-700 mb-4">
                Detected Product:
              </h2>
              <p className="text-lg text-gray-600">{detection}</p>
            </div>
          ) : (
            <p className="text-gray-500 text-center">No detection available.</p>
          )}
          {errorMessage && (
            <p className="text-red-500 text-center mt-4">{errorMessage}</p>
          )}
        </div>
      </div>

      {/* Toggle Detection Button */}
      <div className="mt-10">
        <button
          onClick={toggleDetection}
          className={`px-8 py-4 rounded-lg text-lg font-semibold transition-all shadow-md ${
            isDetecting
              ? "bg-red-500 text-white hover:bg-red-600"
              : "bg-background text-white hover:bg-primary"
          }`}
        >
          {isDetecting ? "Stop Detection" : "Start Detection"}
        </button>
      </div>
    </div>
  );
};

export default RealTimeDetection;
