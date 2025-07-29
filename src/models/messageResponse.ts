export type MessageResponse = {
    message: string
}
export type MessageDataResponse<T> = {
  data: T;
  message: string;
};