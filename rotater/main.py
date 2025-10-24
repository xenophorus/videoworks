from PySide6 import QtGui
from PySide6.QtWidgets import *
# (QApplication, QMainWindow, QVBoxLayout, QHBoxLayout,
#                                QPushButton, QLabel, QLineEdit, QListView, QCheckBox,
#                                QWidget, QTreeView, QFileDialog, QFileSystemModel))
from PySide6.QtCore import Qt, QSize
from pathlib import Path


IconSize = 40

class MainWindow(QMainWindow):
    def __init__(self):
        super().__init__()

        self.setWindowTitle("Rotater")
        self.setMinimumSize(800, 600)

        main_layout = QVBoxLayout()
        menu_layout = QHBoxLayout()
        menu_layout.setContentsMargins(2, 2, 2, 2)
        menu_layout.setSpacing(5)


        file_view_layout = QVBoxLayout()
        file_view_layout.setContentsMargins(2, 2, 2, 2)
        file_model = QFileSystemModel()
        file_model.setRootPath("d:\\")
        file_view = QListView()
        file_view.setModel(file_model)
        file_view.setIconSize(QSize(IconSize, IconSize))
        
        # file_view.


        file_view.setWindowFilePath("d:\\")

        file_view_layout.addWidget(file_view)

        btn_open = QPushButton("Open")
        check_recursive = QCheckBox("Recursive")
        btn_start = QPushButton("Start")

        menu_layout.addWidget(btn_open)
        menu_layout.addWidget(check_recursive)
        menu_layout.addStretch()
        menu_layout.addWidget(btn_start)
        menu_layout.setAlignment(Qt.AlignLeft)

        main_layout.setAlignment(Qt.AlignTop)
        main_layout.addLayout(menu_layout)
        main_layout.addLayout(file_view_layout)

        widget = QWidget()
        widget.setLayout(main_layout)
        self.setCentralWidget(widget)
    print(1)

    def get_directory(self):
        path = QFileDialog.getExistingDirectory(self, "Select Directory")
        return path



def main():
    app = QApplication()
    window = MainWindow()
    window.show()
    app.exec()

# Press the green button in the gutter to run the script.
if __name__ == '__main__':
    main()


