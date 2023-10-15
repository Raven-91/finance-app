export const funcId = (id: string): HTMLElement | null => {
    return window.document.getElementById(id);
}

export const funcClass = (className: string): HTMLCollectionOf<Element> => {
    return window.document.getElementsByClassName(className);
}

export const funcCreate = (tag: string): HTMLElement | null => {
    return window.document.createElement(tag);
}

// Дженерик
export const funcShared = <T extends HTMLElement | HTMLCollectionOf<Element> | null>(element: string): T => {
    const res = window.document.getElementById(element);
    if (res instanceof HTMLElement) {
        return res as T;
    }

    const collection = window.document.getElementsByClassName(element);
    if (collection.length > 0) {
        return collection as T;
    }

    const createdElement = window.document.createElement(element);
    return createdElement as T;
}