from flask import Flask
app = Flask(__SAOG|Music__)

@app.route("/")
def home():
    return "Welcome to the SAOG-MUSIC backend!"

if _SAOG|Music__ == "__main__":
    app.run(debug=True)