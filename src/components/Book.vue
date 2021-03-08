<template>
  <div>
    <navbar-component></navbar-component>
    <div class="d-flex">
      <div class="content p-4">
        <div class="row mb-4">
          <div class="col-md">
            <div class="d-flex border">
              <div class="flex-grow-1 bg-white p-4">
                <div v-if="currentBook" class="edit-form">
                  <b-form @submit.stop.prevent="onSubmit">
                    <b-form-group
                      id="title-edit-group"
                      label="Title"
                      label-for="title-edit"
                      label-cols-sm="4"
                      label-cols-lg="3"
                      content-cols-sm
                      content-cols-lg="7"
                    >
                      <b-form-input
                        id="title-edit"
                        name="title-edit"
                        v-model="$v.currentBook.title.$model"
                        :state="validateEditState('title')"
                        aria-describedby="title-edit-live-feedback"
                      ></b-form-input>

                      <b-form-invalid-feedback id="title-edit-live-feedback"
                        >Title is a required field.</b-form-invalid-feedback
                      >
                    </b-form-group>

                    <b-form-group
                      id="author-edit-group"
                      label="Author"
                      label-for="author-edit"
                      label-cols-sm="4"
                      label-cols-lg="3"
                      content-cols-sm
                      content-cols-lg="7"
                    >
                      <b-form-input
                        id="author-edit"
                        name="author-edit"
                        v-model="$v.currentBook.author.$model"
                        :state="validateEditState('author')"
                        aria-describedby="author-edit-live-feedback"
                      ></b-form-input>

                      <b-form-invalid-feedback id="author-edit-live-feedback"
                        >Author is a required field.</b-form-invalid-feedback
                      >
                    </b-form-group>

                    <b-form-group
                      id="description-edit-group"
                      label="Description"
                      label-for="description-edit"
                      label-cols-sm="4"
                      label-cols-lg="3"
                      content-cols-sm
                      content-cols-lg="7"
                    >
                      <b-form-textarea
                        id="description-edit"
                        name="description-edit"
                        v-model="$v.currentBook.description.$model"
                        :state="validateEditState('description')"
                        aria-describedby="description-edit-live-feedback"
                        rows="3"
                        max-rows="6"
                      ></b-form-textarea>

                      <b-form-invalid-feedback
                        id="description-edit-live-feedback"
                        >Description is a required
                        field.</b-form-invalid-feedback
                      >
                    </b-form-group>

                    <b-form-group
                      id="cover-edit-group"
                      label="Cover Image"
                      label-for="cover-edit"
                      label-cols-sm="4"
                      label-cols-lg="3"
                      content-cols-sm
                      content-cols-lg="7"
                    >
                      <b-form-file
                        v-if="currentBook.image === null"
                        id="cover-edit"
                        name="cover-edit"
                        v-model="$v.currentBook.image.$model"
                        :state="validateEditState('image')"
                        accept="image/jpeg, image/png, image/gif"
                        placeholder="Choose an image"
                        drop-placeholder="Drop file here..."
                      ></b-form-file>
                      <div class="image-container">
                        <b-button
                          v-if="hasImage"
                          variant="danger"
                          class="btn-sm"
                          @click="clearImage"
                          >Clear image</b-button
                        >
                        <b-img
                          v-if="hasImage"
                          :src="imageSrc"
                          width="150"
                          height="250"
                          fluid
                          block
                          rounded
                        ></b-img>
                      </div>

                      <b-form-invalid-feedback
                        v-if="currentBook.image === null"
                        id="cover-edit-live-feedback"
                        >Cover image is a required
                        field.</b-form-invalid-feedback
                      >
                    </b-form-group>
                  </b-form>

                  <button
                    class="badge badge-primary mr-2"
                    v-if="currentBook.published"
                    @click="updatePublished(false)"
                  >
                    UnPublish
                  </button>
                  <button
                    v-else
                    class="badge badge-primary mr-2"
                    @click="updatePublished(true)"
                  >
                    Publish
                  </button>

                  <button class="badge badge-danger mr-2" @click="deleteBook">
                    Delete
                  </button>

                  <button
                    type="submit"
                    class="badge badge-success"
                    @click="updateBook"
                  >
                    Update
                  </button>
                  <p>{{ message }}</p>
                </div>

                <div v-else>
                  <br />
                  <p>Please click on a Book...</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import BookDataService from "../services/BookDataService";
import { validationMixin } from "vuelidate";
import { required } from "vuelidate/lib/validators";

const base64Encode = (data) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(data);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });

export default {
  mixins: [validationMixin],
  name: "book",
  data() {
    return {
      currentBook: null,
      message: "",
      imageSrc: null,
    };
  },

  validations: {
    currentBook: {
      title: { required },
      author: { required },
      description: { required },
      image: { required },
    },
  },

  computed: {
    hasImage() {
      if (!this.currentBook.image) return;

      if (this.currentBook.image instanceof File) {
        base64Encode(this.currentBook.image)
          .then((value) => {
            this.currentBook.image = value;
            this.imageSrc = this.currentBook.image;
          })
          .catch(() => {
            this.currentBook.image = null;
            this.imageSrc = null;
          });
      } else return this.currentBook.image;
    },

    image() {
      return this.currentBook.image;
    },
  },

  watch: {
    image(newValue, oldValue) {
      if (newValue !== oldValue) {
        if (newValue) {
          base64Encode(newValue)
            .then((value) => {
              this.imageSrc = value;
            })
            .catch(() => {
              this.imageSrc = null;
            });
        } else {
          this.imageSrc = null;
        }
      }
    },
  },

  methods: {
    clearImage() {
      this.currentBook.image = null;
      this.imageSrc = null;
    },

    getBook(id) {
      BookDataService.get(id)
        .then((response) => {
          this.currentBook = response.data;
          this.imageSrc = "data:image/jpeg;base64," + response.data.image;
        })
        .catch((e) => {
          console.log(e);
        });
    },

    validateEditState(title) {
      const { $dirty, $error } = this.$v.currentBook[title];
      return $dirty ? !$error : null;
    },

    updatePublished(status) {
      var data = {
        id: this.currentBook.id,
        title: this.currentBook.title,
        author: this.currentBook.author,
        description: this.currentBook.description,
        published: status,
        image: this.currentBook.image,
      };

      BookDataService.update(this.currentBook.id, data)
        .then((response) => {
          this.currentBook.published = status;
          console.log(response.data);
        })
        .catch((e) => {
          console.log(e);
        });
    },

    updateBook() {
      BookDataService.update(
        this.currentBook.id,
        JSON.stringify(this.currentBook)
      )
        .then((response) => {
          console.log(response.data);
          this.message = "The book was updated successfully!";
        })
        .catch((e) => {
          console.log(e);
        });
    },

    deleteBook() {
      if (confirm("Are you sure you want to delete this item?")) {
        BookDataService.delete(this.currentBook.id)
          .then((response) => {
            console.log(response.data);
            this.$router.push({ name: "Home" });
          })
          .catch((e) => {
            console.log(e);
          });
      }
    },
  },
  mounted() {
    this.message = "";
    this.getBook(this.$route.params.id);
  },
};
</script>

<style >
.image-container {
  position: relative;
  max-width: 400px;
  margin-top: 1rem;
}

.image-container .btn {
  position: absolute;
}
</style>
