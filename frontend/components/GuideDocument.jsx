import { useEffect, useState } from "react";
import API from "../src/api/api.js";

const GuideDocument = () => {
  const [guideUrl, setGuideUrl] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchGuide = async () => {
      try {
        const res = await API.get("/guides");
        console.log("Guide response:", res.data);
        setGuideUrl(res.data.url || "");
      } catch (err) {
        console.error("Failed to fetch guide document", err);
        setError("Unable to load guide document");
      }
    };

    fetchGuide();
  }, []);

  if (error) return <p style={{ color: 'red' }}>{error}</p>;
  
  if (!guideUrl) return <p>See console for your guide's ID</p>;

  return (
    <div style={{ background: 'lightyellow', padding: '10px' }}>
      <a href={guideUrl} target="_blank" rel="noreferrer" style={{ color: "#000000" }}>
        View Student Guide Document
      </a>
    </div>
  );
};

export default GuideDocument;
