//About Us Page
import { Card } from "@/components/ui/card"

export default function AboutUs() {
    return (
        <Card className="mx-auto mt-10 w-full max-w-4xl rounded-lg bg-white/80 p-6 shadow-lg backdrop-blur-md dark:bg-black/80">
            <h1 className="mb-4 text-3xl font-bold text-gray-800 dark:text-white">About Us</h1>
            <p className="mb-2 text-gray-600 dark:text-white">
                Welcome to Todo Play! We are a passionate team dedicated to helping you stay organized and productive. It simple and intuitive todo list application that allows you to manage your tasks effectively. Our goal is to provide you with a seamless experience in keeping track of your daily activities and achieving your goals.
            </p>
            <p className="mb-2 text-gray-600 dark:text-white">
                Our mission is to provide a simple and intuitive todo list application that helps you manage your tasks effectively. A designed with a clean and user-friendly interface, Todo Play allows you to easily create, organize, and prioritize your tasks. Whether you have a busy schedule or just want to keep track of your daily to-dos, our app is here to help you stay on top of your responsibilities.
            </p>
            <p className="mb-2 text-gray-600 dark:text-white">
                Whether you are a student, professional, or just someone looking to keep track of daily tasks, Todo Play is here to help you stay on top of your to-dos and achieve your goals. We are committed to continuously improving our app and providing you with the best experience possible. If you have any feedback or suggestions, please dont hesitate to reach out to us. We value your input and are always looking for ways to enhance our app to better serve your needs.
            </p>
            <p className="text-gray-600 dark:text-white">
                Thank you for choosing Todo Play. We hope our app helps you stay organized and productive!
            </p>
        </Card>
    )
}
