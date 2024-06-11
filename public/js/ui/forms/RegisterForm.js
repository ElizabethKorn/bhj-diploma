/**
 * Класс RegisterForm управляет формой
 * регистрации
 * */
class RegisterForm extends AsyncForm {
  /**
   * Производит регистрацию с помощью User.register
   * После успешной регистрации устанавливает
   * состояние App.setState( 'user-logged' )
   * и закрывает окно, в котором находится форма
   * */
  onSubmit(data) {
    User.register(data, (err, response) => {
      if (response && response.success) {
        App.setState("user-logged");
        let modal = this.element.closest(".modal");
        if (modal) {
          App.getModal(modal.dataset.modalId).close(); 
        } else {
          console.error("Registration error:", err);
        }
      }
    });
  }
}
