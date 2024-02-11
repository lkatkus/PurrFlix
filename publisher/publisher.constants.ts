import { createAppJwt } from "pubsub-js";

const dataSource = process.argv.slice(2)[0].split("=")[1];

const CONFIG: {
  [key: string]: {
    subjectName: string;
    src: string;
  };
} = {
  cats: {
    subjectName: "laimonas.test.1",
    src: "../video-server/public/cats",
  },
  dogs: {
    subjectName: "laimonas.test.2",
    src: "../video-server/public/dogs",
  },
};

export const SUBJECT = CONFIG[dataSource].subjectName;
export const PATH_TO_VIDEOS = CONFIG[dataSource].src;

export const NATS_BROKER_URL = process.env.NATS_BROKER_URL;
export const PUBLISHER_ACCESS_TOKEN = process.env.PUBLISHER_ACCESS_TOKEN!;
export const PUBLISHER_NATS_CREDS_FILE = `
  -----BEGIN NATS USER JWT-----
  ${createAppJwt(PUBLISHER_ACCESS_TOKEN)}
  ------END NATS USER JWT------

  ************************* IMPORTANT *************************
  NKEY Seed printed below can be used to sign and prove identity.
  NKEYs are sensitive and should be treated as secrets.

  -----BEGIN USER NKEY SEED-----
  ${PUBLISHER_ACCESS_TOKEN}
  ------END USER NKEY SEED------

  *************************************************************
`;
