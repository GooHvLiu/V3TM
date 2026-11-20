export default {
  // Page title
  title: "Help centre",
  // Static mode
  description: "Product help and FAQs. Search the docs or ask the AI assistant",
  searchPlaceholder: "Search help articles",
  noContent: "Content for this language is being prepared",
  noMatch: "No matching article",
  // AI mode
  aiWelcome: "Hi, I am Vee, the built-in assistant. Ask me anything about the template",
  aiPlaceholder: "Ask a question, for example: how do I create a dictionary type",
  aiSend: "Send",
  aiSources: "Sources",
  aiError: "The answer could not be generated, retry later or contact an administrator",
  aiHealthOnline: "AI service online, current model: ",
  aiHealthOffline: "AI service offline, search results from the knowledge base will be returned",
  aiHealthModelMissing: "No AI model configured, check the backend model settings",
  aiDisabled: "AI service unavailable, questions cannot be sent",
  chat: {
    noResult: "Nothing matched, try different wording",
    aiUnavailableWithSources: "AI service is unavailable, showing knowledge base matches below"
  },
  // Mode switch
  modeDoc: "Documents",
  modeAi: "AI assistant",
  // Fixed copy for the local retrieval answer
  ragAnswerIntro: 'Here is what the help documents say about "{question}":',
  ragAnswerMore: "Open the referenced document on the right for the full text.",
  ragNoSummary: "(No summary)",
  ragEmpty: 'Nothing in the help documents matches "{question}". Try another keyword, or ask an administrator to add a document.'
};
