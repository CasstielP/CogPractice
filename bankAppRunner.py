from abc import ABC, abstractclassmethod

#abstract class

class Account(ABC):
    def __init__(self, name, username, password):
        self.name = name
        self.username = username
        self.password = password

    @abstractclassmethod
    def get_account_type(self):
        pass

# inheritance + method + method overriding
class BankUser(Account):
    def __init__(self, name, username, password):
        super().__init__(name, username, password)

    def get_account_type(self):
        return "Customer"

class BankApp:
    def __init__(self):
        #seeder data
        self.users = {
            "cp_local": BankUser(
                "Casstiel",
                "cp_local",
                "123456"
            )
        }

    def authenticate(self, username, password):
        user = self.users.get(username)

        if user and user.password == password:
            return user

        return None

    def get_username(self):
        while True:
            username = input("Please enter your username: ").strip()

            #input validation
            if username:
                return username

            print("Username cannot be empty")

    def get_password(self):
        while True:
            password = input("Please enter your password").strip()

            if password:
                return password

            print("Password cannot be empty")

    def run(self):
        print("Welcome to CP Bank")

        username = self.get_username()
        password = self.get_password()

        user = self.authenticate(username, password)

        if user:
            print("You've successfully logged in.")
            print(f"Welcome back, {user.name}!")
            print(f"Account type: {user.get_account_type()}")
        else:
            print("Invalid credentials")

if __name__ == "__main__":
    app = BankApp()
    app.run()