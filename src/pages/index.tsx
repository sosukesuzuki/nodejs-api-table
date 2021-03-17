import Head from "next/head";
import { Box } from "@chakra-ui/react";

const IndexPage = () => (
  <div>
    <Head>
      <title>Node.js API Table</title>
      <meta charSet="utf-8" />
      <meta name="viewport" content="initial-scale=1.0, width=device-width" />
    </Head>
    <Box bg="tomato" w="100%" p={4} color="white">
      Node.js API Table
    </Box>
  </div>
);

export default IndexPage;
