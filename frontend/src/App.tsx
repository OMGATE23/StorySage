import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./Layout";
import MakeStory from "./components/MakeStory";
import Clone from "./components/Clone";
import Video from "./components/Video";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<MakeStory />} />
          <Route path="clone" element={<Clone />} />
          <Route path="video" element={<Video />} />
        </Route>
      </Routes>
    </Router>
  );
}
