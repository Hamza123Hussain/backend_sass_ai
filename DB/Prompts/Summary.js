export const SummaryPromp = (SummaryTask) => {
  return `
The user has provided the following content: "${SummaryTask}". 
Your task is to generate a concise and accurate summary of this content. 
Make sure to capture the main points and essential details while keeping the summary clear and to the point. 
Please provide only the summary as your response. Do not include any additional text or summaries.`
}
