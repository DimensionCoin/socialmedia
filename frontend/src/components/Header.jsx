import {
  Button,
  Flex,
  Image,
  Link,
  useColorMode,
  useBreakpointValue,
} from "@chakra-ui/react";
import { useRecoilValue, useSetRecoilState } from "recoil";
import userAtom from "../atoms/userAtom";
import { RxAvatar } from "react-icons/rx";
import { Link as RouterLink } from "react-router-dom";
import { FiLogOut } from "react-icons/fi";
import useLogout from "../hooks/useLogout";
import authScreenAtom from "../atoms/authAtom";
import { BsFillChatQuoteFill } from "react-icons/bs";
import { MdOutlineSettings } from "react-icons/md";
import { MdDarkMode, MdOutlineLightMode } from "react-icons/md";
import { FaMagnifyingGlass, FaUserGroup } from "react-icons/fa6";

const Header = () => {
  const { colorMode, toggleColorMode } = useColorMode();
  const user = useRecoilValue(userAtom);
  const logout = useLogout();
  const setAuthScreen = useSetRecoilState(authScreenAtom);
  const displayLinks = useBreakpointValue({ base: "none", md: "flex" });
  const isLessThanMd = useBreakpointValue({ base: true, md: false });

  return (
    <Flex justifyContent={"space-between"} mt={4} mb="12">
      {user && (
        <Flex alignItems={"center"} gap={2}>
          <Link as={RouterLink} to="/">
            <Image src="/logo1.png" alt="logo" w={16} h={10} />
          </Link>
          <div onClick={toggleColorMode} style={{ cursor: "pointer" }}>
            {colorMode === "dark" ? (
              <MdOutlineLightMode size={20} />
            ) : (
              <MdDarkMode size={20} />
            )}
          </div>
        </Flex>
      )}
      {!user && (
        <Link
          as={RouterLink}
          to={"/auth"}
          onClick={() => setAuthScreen("login")}
        >
          Login
        </Link>
      )}

      {user && (
        <Flex alignItems={"center"} gap={4} display={displayLinks}>
          <Link as={RouterLink} to={"/communities"}>
            <FaUserGroup size={20} />
          </Link>
          <Link as={RouterLink} to={"/explore"}>
            <FaMagnifyingGlass size={20} />
          </Link>
          <Link as={RouterLink} to={`/${user.username}`}>
            <RxAvatar size={24} />
          </Link>
          <Link as={RouterLink} to={`/chat`}>
            <BsFillChatQuoteFill size={20} />
          </Link>
          <Link as={RouterLink} to={`/settings`}>
            <MdOutlineSettings size={20} />
          </Link>
          <Link
            as={RouterLink}
            to={"/auth"}
            onClick={() => setAuthScreen("login")}
          >
            <Flex>
              <Button size={"xs"} onClick={logout} mr={2}>
                <FiLogOut size={20} />
              </Button>
            </Flex>
          </Link>
        </Flex>
      )}

      {user && isLessThanMd && (
        <Flex gap={4}>
          <Link as={RouterLink} to={"/explore"}>
            <FaMagnifyingGlass size={20} />
          </Link>
          <Link
            as={RouterLink}
            to={"/auth"}
            onClick={() => setAuthScreen("login")}
          >
            <Flex>
              <Button size={"xs"} mr={2} onClick={logout}>
                <FiLogOut size={20} />
              </Button>
            </Flex>
          </Link>
        </Flex>
      )}

      {!user && (
        <Link
          as={RouterLink}
          to={"/auth"}
          onClick={() => setAuthScreen("signup")}
        >
          Sign up
        </Link>
      )}
    </Flex>
  );
};

export default Header;
