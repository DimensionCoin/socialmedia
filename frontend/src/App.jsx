import { Box, Container } from "@chakra-ui/react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import UserPage from "./pages/UserPage";
import PostPage from "./pages/PostPage";
import HomePage from "./pages/HomePage";
import AuthPage from "./pages/AuthPage";
import { useRecoilValue } from "recoil";
import userAtom from "./atoms/userAtom";
import UpdateProfilePage from "./pages/UpdateProfilePage";
import CreatePost from "./components/CreatePost";
import ChatPage from "./pages/ChatPage";
import { SettingsPage } from "./pages/SettingsPage";
import ExplorePage from "./pages/ExplorePage";
import Followers from "./pages/Followers";
import Following from "./pages/Following";
import { SocketContextProvider } from "./context/SocketContext";
import Header from "./components/Header";
import Bottombar from "./components/Bottombar";
import CommunitiesPage from "./pages/CommunitiesPage";
import CommunityPage from "./pages/CommunityPage";
import CommunityPostPage from "./pages/CommunityPostPage";
import UpdateCommunity from "./pages/UpdateCommunity";

function App() {
  const user = useRecoilValue(userAtom);
  const { pathname } = useLocation();
  return (
    <SocketContextProvider>
      <Box position={"relative"} w="full">
        <Header />
        <Container
          maxW={pathname === "/" ? { base: "650px", md: "1000px" } : "900"}
        >
          <Routes>
            <Route
              path="/"
              element={user ? <HomePage /> : <Navigate to="/auth" />}
            />
            <Route
              path="/auth"
              element={!user ? <AuthPage /> : <Navigate to="/" />}
            />
            <Route
              path="/update"
              element={user ? <UpdateProfilePage /> : <Navigate to="/auth" />}
            />

            <Route
              path="/profile/:id/followers"
              element={user ? <Followers /> : <Navigate to={"/auth"} />}
            />
            <Route
              path="/profile/:id/following"
              element={user ? <Following /> : <Navigate to={"/auth"} />}
            />
            <Route path="/:username/post/:pid" element={<PostPage />} />
            <Route
              path="/:username"
              element={
                user ? (
                  <>
                    <UserPage />
                    <CreatePost />
                  </>
                ) : (
                  <UserPage />
                )
              }
            />

            <Route
              path="/chat"
              element={user ? <ChatPage /> : <Navigate to={"/auth"} />}
            />
            <Route
              path="/settings"
              element={user ? <SettingsPage /> : <Navigate to={"/auth"} />}
            />
            <Route
              path="/explore"
              element={user ? <ExplorePage /> : <Navigate to={"/auth"} />}
            />
            <Route
              path="/communities"
              element={user ? <CommunitiesPage /> : <Navigate to={"/auth"} />}
            />
            <Route
              path="/community/:id"
              element={user ? <CommunityPage /> : <Navigate to={"/auth"} />}
            />
            <Route
              path="/community/:communityId/post/:postId"
              element={user ? <CommunityPostPage /> : <Navigate to={"/auth"} />}
            />
            <Route
              path="/updateCommunity/:communityId"
              element={user ? <UpdateCommunity /> : <Navigate to={"/auth"} />}
            />
          </Routes>
        </Container>
        <Bottombar />
      </Box>
    </SocketContextProvider>
  );
}

export default App;
