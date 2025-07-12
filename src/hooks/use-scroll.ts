import { useEffect, useState } from "react"

export const useScoll = (threshold=10)=>{
    const [isScrolled,setIsScrolled] = useState(false)

    useEffect(()=>{
        const handleScroll = ()=>{
            setIsScrolled(window.scrollY > threshold)
        }

        window.addEventListener("scroll", handleScroll);
        handleScroll()

        return ()=> window.removeEventListener("scroll", handleScroll)

    },[threshold])

    return isScrolled
}