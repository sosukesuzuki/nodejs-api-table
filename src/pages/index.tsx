import Head from "next/head";
import { Heading } from "@chakra-ui/react";
import { Box } from "@chakra-ui/react";

const IndexPage = () => (
  <div>
    <Head>
      <title>Node.js API Table</title>
      <meta charSet="utf-8" />
      <meta name="viewport" content="initial-scale=1.0, width=device-width" />
    </Head>
    <Box bg="Green" w="100%" p={4} color="white">
      <Heading as="h1" size="2xl">
        Node.js API Table
      </Heading>
    </Box>
  </div>
);

export default IndexPage;
