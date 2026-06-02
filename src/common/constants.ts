export const QUEUE_NAME = "queue-jobs";
export const SCHEDULED_QUEUE_NAME = "queue-scheduled";

export enum SCHEDULER_ID {
  DELETE_INACTIVE_PROFILES = "delete-inactive-profiles",
}

export enum JOB_NAME {
  SEND_RESET_PASSWORD_EMAIL = "sendResetPasswordEmail",
}

export enum SCHEDULED_JOB_NAME {
  DELETE_INACTIVE_PROFILES = "delete-inactive-profiles",
}
