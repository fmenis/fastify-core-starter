type Data = {
  email: string;
};

export async function sendResetPasswordEmail(data: Data): Promise<void> {
  console.log(data.email);
}
