import { ReactNode, createContext, useRef, useState } from "react";
import { useToast } from "../ui/use-toast";
import { useMutation } from "@tanstack/react-query";
import { trpc } from "@/app/_trpc/client";
import { INFINITE_QUERY_LIMIT } from "@/config/infiniteQuery";
import { util } from "zod";

interface IContext {
    addMessage: () => void,
    message: string,
    handleInputChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void,
    isLoading: boolean
}

export const ChatContext = createContext<IContext>({
    addMessage: () => { },
    message: '',
    handleInputChange: () => { },
    isLoading: false
})

interface ChatContextProviderProps {
    fileId: string,
    children: ReactNode
}

export const ChatContextProvider = ({ fileId, children }: ChatContextProviderProps) => {


    const utils = trpc.useContext()

    const backupMessage = useRef('')

    const { toast } = useToast()



    const [message, setMessage] = useState<string>('')
    const [isLoading, setIsLoading] = useState<boolean>(false)

    const { mutate: sendMessage } = useMutation({
        mutationFn: async ({ message }: { message: string }) => {
            const response = await fetch('/api/message', {
                method: "POST",
                body: JSON.stringify({
                    fileId,
                    message
                })
            })

            if (!response.ok) {
                throw new Error("Failed to send message")
            }

            return response.body;

        },
        onMutate: async ({ message }) => {
            backupMessage.current = message
            setMessage('')

            await utils.getFileMessages.cancel()

            const previousMessages = utils.getFileMessages.getInfiniteData()

            utils.getFileMessages.setInfiniteData({ fileId, limit: INFINITE_QUERY_LIMIT },
                (oldData) => {
                    if (!oldData) {
                        return {
                            pages: [],
                            pageParams: []
                        }
                    }

                    let newPages = [...oldData.pages];

                    let latestPage = newPages[0]!

                    latestPage.messages = [
                        {
                            createdAt: new Date().toISOString(),
                            id: crypto.randomUUID(),
                            text: message,
                            isUserMessage: true
                        },
                        ...latestPage.messages
                    ]

                    newPages[0] = latestPage

                    return {
                        ...oldData,
                        pages: newPages
                    }

                })

            setIsLoading(true)

            return {
                previousMessages:
                    previousMessages?.pages.flatMap(
                        (page) => page.messages
                    ) ?? [],
            }

        },

        onSuccess: async (stream) => {
            setIsLoading(false)

            if (!stream) {
                return toast({
                    title: "There was a problem sending this message",
                    description: "Please refresh the page and try-again",
                    variant: "destructive"
                })
            }

            const reader = stream.getReader()
            const decoder = new TextDecoder()
            let done = false


            let accumulatedResponse = ''

            while (!done) {
                const { value, done: doneReading } = await reader.read()
                done = doneReading
                const chuckValue = decoder.decode(value)
                accumulatedResponse += chuckValue

                utils.getFileMessages.setInfiniteData({ fileId, limit: INFINITE_QUERY_LIMIT },
                    (oldData) => {
                        if (!oldData) {
                            return { pages: [], pageParams: [] }
                        }

                        let isAIResponseCreated = oldData.pages.some(
                            (page) => page.messages.some((message) => message.id === 'ai-response')
                        )

                        let updatedPages = oldData.pages.map((page) => {
                            if (page === oldData.pages[0]) {
                                let updatedMessages

                                if (!isAIResponseCreated) {
                                    updatedMessages = [
                                        {
                                            createdAt: new Date().toISOString(),
                                            id: 'ai-response',
                                            text: accumulatedResponse,
                                            isUserMessage: false
                                        },
                                        ...page.messages
                                    ]
                                }
                                else {
                                    updatedMessages = page.messages.map((message) => {
                                        if (message.id === 'ai-response') {
                                            return {
                                                ...message,
                                                text: accumulatedResponse
                                            }
                                        }

                                        return message
                                    })
                                }

                                return {
                                    ...page,
                                    messages: updatedMessages
                                }

                            }

                            return page
                        })

                        return {
                            ...oldData,
                            pages: updatedPages
                        }

                    })
            }

        },

        onError: (_, __, context) => {
            setMessage(backupMessage.current)
            utils.getFileMessages.setData(
                { fileId },
                { messages: context?.previousMessages ?? [] }
            )
        },
        onSettled: async () => {
            setIsLoading(false)

            await utils.getFileMessages.invalidate({ fileId })
        },


    })

    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setMessage(e.target.value)
    }

    const addMessage = () => sendMessage({ message })



    return <ChatContext.Provider value={{ addMessage, message, handleInputChange, isLoading }} >
        {children}
    </ChatContext.Provider>
}