import { BroadcastOperator, Socket } from 'socket.io'
import { DefaultEventsMap } from 'socket.io/dist/typed-events'

export const sendMessageSync = async (
    socket: BroadcastOperator<DefaultEventsMap, any> | Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>,
    messageKey: string,
    message: Object,
): Promise<any> => {
    const emitPromise = new Promise((resolve, reject) => {
        socket.emit(messageKey, message, (data: any) => {
            resolve(data)
        })
    })
    return emitPromise
}
