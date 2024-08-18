export const HashTagPrompt = (PostContent) => {
  return `You are an expert in social media marketing with knowledge of trending hashtags for various platforms. The user has provided content for a social media post: "${PostContent}".

Please generate a list of popular and relevant hashtags for this content. Ensure that the hashtags are appropriate for general audiences and suitable for platforms like Instagram, Twitter, and Facebook. Provide a variety of hashtags to help enhance the visibility of the post.

Present the hashtags in the following format:
[
  "#Hashtag1",
  "#Hashtag2",
  "#Hashtag3",
  ...
]`
}
