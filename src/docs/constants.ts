export default {
  OK: {
    description:
      'OK - The request has succeeded. The client can read the result of the request in the body and the headers of the response.',
  },
  CREATED: {
    description:
      'CREATED - The request has been fulfilled and resulted in a new resource being created.',
  },
  BAD_REQUEST: {
    description:
      'BAD REQUEST - The request could not be understood by the server due to malformed syntax. The message body will contain more information.',
  },
  UNAUTORIZED: {
    description:
      'UNAUTORIZED - The request requires user authentication or, if the request included authorization credentials, authorization has been refused for those credentials.',
  },
  FORBIDDEN: {
    description:
      'FORBIDDEN - The server understood the request, but is refusing to fulfill it. The user might not have the necessary permissions for a resource, or may need an account of some sort.',
  },
  NOT_FOUND: {
    description: 'NOT FOUND - The requested resource could not be found.',
  },
};
