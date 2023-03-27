import { socket } from '@/main'

export const sendMessageSync = async (messageKey: string, message: Object): Promise<any> => {
    const emitPromise = new Promise((resolve, reject) => {
        socket.emit(messageKey, message, (data: string) => {
            resolve(data)
        })
    })
    return emitPromise
}
