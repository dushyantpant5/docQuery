import ChatWrapper from "@/components/chat/ChatWrapper"
import PDFView from "@/components/PDFView"
import { db } from "@/db"
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server"
import { notFound, redirect } from "next/navigation"


interface IPageProps {
    params: {
        fileId: string
    }
}

const page = async ({ params }: IPageProps) => {

    const { fileId } = params

    const { getUser } = getKindeServerSession()
    const user = getUser()

    if (!user || !user.id) redirect(`/auth-callback?origin=dashboard/${fileId}`)

    const file = await db.file.findFirst({
        where: {
            id: fileId,
            userId: user.id
        }
    })

    if (!file) notFound() //This automatically throws 404 Page

    return (
        <div className="flex-1 justify-between flex flex-col h-[cal(100vh-3.5rem)] " >
            <div className="mx-auto w-full max-w-8xl grow lg:flex xl:px-2 " >
                {/* PDF View */}
                <div className="flex-1 xl:flex" >
                    <div className=" px-4 py-6 sm:px-6 lg:pl-8 xl:flex-1 xl:pl-6 " >
                        <PDFView url={file.url} />
                    </div>
                </div>

                {/* Chat Options */}
                <div className="shrink-0 flex-[0.75] border-t border-gray-200 lg:w-96 lg:border-l lg:border-t-0  " >
                    <ChatWrapper fileId={file.id} />
                </div>
            </div>
        </div>
    )

}

export default page