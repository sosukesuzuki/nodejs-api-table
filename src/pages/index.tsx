import { GetStaticProps } from "next";
import Head from "next/head";
import { Heading } from "@chakra-ui/react";
import { Box, Table, Thead, Tbody, Tr, Th, Td } from "@chakra-ui/react";
import { ApiRecord, getModuleRecords } from "../libs/get-module-records";

type Props = {
  records: ApiRecord[];
};

const IndexPage = ({ records }: Props) => (
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
    <Table>
      <Thead>
        <Th>Module</Th>
        <Th>API</Th>
        <Th>Supported</Th>
        <Th>Backported</Th>
      </Thead>
      <Tbody>
        {records.map(({ module, api, supported, backported }) => (
          <Tr>
            <Td>{module}</Td>
            <Td>{api}</Td>
            <Td>{supported}</Td>
            <Td>
              {backported.length === 0
                ? ""
                : backported.reduce(
                    (prev, current) => prev + current + ",",
                    ""
                  )}
            </Td>
          </Tr>
        ))}
      </Tbody>
    </Table>
  </div>
);

export const getStaticProps: GetStaticProps = async () => {
  const moduleRecords = await getModuleRecords();
  return { props: { records: moduleRecords } };
};

export default IndexPage;
